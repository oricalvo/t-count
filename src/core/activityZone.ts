import {Activity} from "./activity";
import {Profiler} from "./profiler";
import {appLogger} from "./logger";

const logger = appLogger.create("ActivityZone");

export class ActivityZone {
    profiler: Profiler;
    hasMicroTasks: boolean;
    hasMacroTasks: boolean;
    finished: boolean;

    onStart: (activity: Activity)=>void = noop;
    onFinish: (activity: Activity)=>void = noop;
    onEnter: (activity: Activity)=>void = noop;
    onLeave: (activity: Activity)=>void = noop;

    constructor(profiler: Profiler) {
        this.profiler = profiler;
    }

    checkFinish(activity: Activity) {
        if(!this.finished && !this.hasMicroTasks && !this.hasMacroTasks) {
            this.finished = true;

            this.onFinish(activity);
        }
    }

    onInvokeTask(delegate: ZoneDelegate, current: Zone, target: Zone, task: Task, applyThis: any, applyArgs: any): any {
        if (task.type == "eventTask") {
            delegate.invokeTask(target, task, applyThis, applyArgs);
            return;
        }

        let activity: Activity = Zone.current.get("activity");

        this.onEnter(activity);

        try {
            delegate.invokeTask(target, task, applyThis, applyArgs);
        }
        finally {
            this.checkFinish(activity);

            this.onLeave(activity);
        }
    }

    onHasTask(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, hasTaskState: HasTaskState) {
        let activity: Activity = Zone.current.get("activity");

        parentZoneDelegate.hasTask(targetZone, hasTaskState);

        if (hasTaskState.change == "microTask") {
            this.hasMicroTasks = hasTaskState.microTask;

            this.checkFinish(activity);
        }
        else if (hasTaskState.change == "macroTask") {
            this.hasMacroTasks = hasTaskState.macroTask;

            this.checkFinish(activity);
        }
    }

    private fork(activity: Activity) {
        const spec: ZoneSpec = {
            name: "activity",

            properties: {
                isActivityZone: true,
                activity: activity,
            },

            onInvokeTask: this.onInvokeTask.bind(this),

            onHasTask: this.onHasTask.bind(this),
        };

        const zone = Zone.current.fork(spec);

        return zone;
    }

    run<T>(fn: ()=>T, activityFactory: ()=>Activity): T {
        const me = this;

        let activity: Activity = Zone.current.get("activity");
        if(activity) {
            return fn();
        }

        activity = activityFactory();

        const zone = this.fork(activity);

        return <T>zone.run(function() {
            const activity = Zone.current.get("activity")

            me.onStart(activity);

            try {
                return fn();
            }
            finally {
                me.checkFinish(activity);
            }
        });
    }
}

function noop() {
}
