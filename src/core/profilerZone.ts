import {appLogger} from "./logger";

const logger = appLogger.create("ProfilerZone");

export class ProfilerZone {
    private inner: Zone;
    private outer: Zone;

    onEnter: ()=>void = noop;
    onLeave: ()=>void = noop;
    onEvent: (task: Task)=>void = noop;

    constructor() {
        this.outer = Zone.current;
        this.inner = this.forkZone();
    }

    run<T>(fn: ()=>T): T {
        return this.inner.run(fn) as T;
    }

    runOutsideProfiler<T>(fn: () => T): T {
        return this.outer.run(fn) as T;
    }

    forkZone() {
        const me = this;

        return this.outer.fork({
            name: 'profiler',

            properties: {
                'isProfilerZone': true
            },

            onInvokeTask: (delegate: ZoneDelegate, current: Zone, target: Zone, task: Task, applyThis: any, applyArgs: any): any => {
                me.onEnter();

                if(task.type == "eventTask") {
                    this.onEvent(task);
                }

                try {
                    delegate.invokeTask(target, task, applyThis, applyArgs);
                } finally {
                    me.onLeave();
                }
            },
        });
    }
}

function noop() {
}
