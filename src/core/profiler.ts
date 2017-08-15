import {Counter} from "./counter";
import {CounterSet} from "./counterSet";
import {ProfilerZone} from "./profilerZone";
import {Activity} from "./activity";
import {ActivityZone} from "./activityZone";
import {VmTurn} from "./vmTurn";
import {Logger} from "complog";
import {EventEmitter} from "../util/eventEmitter";

if (typeof Zone == 'undefined') {
    throw new Error('angular-profiler requires Zone.js prolyfill.');
}

const logger = Logger.create("Profiler");

export class Profiler {
    private _profilerZone: ProfilerZone;
    private _activityZone: ActivityZone;
    private _counters: Counter[];
    private _activity: Activity|null;
    private _data: {[name: string]: any};
    private _sets: CounterSet[];
    private _counterSetAll: CounterSet;
    private _counterSetLast: CounterSet;
    private _vmTurn: VmTurn|null;

    activityStarted: EventEmitter<CounterSet> = new EventEmitter<CounterSet>();
    counterUpdated: EventEmitter<Counter> = new EventEmitter<Counter>();

    constructor() {
        this._counters = [];
        this._data = {};
        this._activity = null;

        this._profilerZone = new ProfilerZone();
        this._profilerZone.onEnter = this.onEnterVmTurn.bind(this);
        this._profilerZone.onLeave = this.onLeaveVmTurn.bind(this);
        this._profilerZone.onEvent = this.onEvent.bind(this);

        this._activityZone = new ActivityZone(this);
        this._activityZone.onStart = this.onStartActivity.bind(this);
        this._activityZone.onFinish = this.onFinishActivity.bind(this);
        this._activityZone.onEnter = this.onEnterActivity.bind(this);
        this._activityZone.onLeave = this.onLeaveActivity.bind(this);

        for (let counter of this._counters) {
            counter.onRegistered(this);
        }
    }

    patch(counters: {[name: string]: Counter}) {
        for (let name in counters) {
            const counter = counters[name];
            const resolved = counter.patch();

            for(let c of resolved) {
                c.onRegistered(this);

                this._counters.push(c);
            }
        }

        this._counterSetAll = this.createSet("all");
        this._counterSetLast = this.createSet("last");
        this._sets = [this._counterSetAll, this._counterSetLast];
    }

    run<T>(fn: () => T): T {
        return this._profilerZone.run(fn);
    }

    activity<T>(fn: ()=>T): T {
        return this._activityZone.run(fn, this.createActivity.bind(this));
    }

    get sets(): CounterSet[] {
        return this._sets;
    }

    get all(): CounterSet {
        return this._counterSetAll;
    }

    get last(): CounterSet {
        return this._counterSetLast;
    }

    private onEnterVmTurn() {
        //logger.log("ENTER VmTurn");

        this._vmTurn = new VmTurn(this.createSet("vmTurn"));

        // let activity: Activity = Zone.current.get("profilerActivity");
        // if (activity) {
        //     this._activity = activity;
        //     return;
        // }
        //
        // this._counterSetLast.reset();
        // this._activity = new Activity(this._counterSetLast);
    }

    private onLeaveVmTurn() {
        //logger.log("LEAVE VmTurn");

        this._vmTurn = null;
        // if (this._activity) {
        //     this._activity = null;
        // }
    }

    private onEvent(task: Task) {
        if(task.source.indexOf("addEventListener:click")!=-1) {
            this._counterSetLast.reset();

            this._activity = new Activity(this._counterSetLast);
        }
    }

    private onStartActivity(activity: Activity) {
        logger.log("START Activity");
    }

    private onFinishActivity(activity: Activity) {
        logger.log("FINISH Activity");
    }

    private onEnterActivity(activity: Activity) {
        logger.log("ENTER Activity");
    }

    private onLeaveActivity(activity: Activity) {
        logger.log("LEAVE Activity");
    }

    setData(name: string, value: any) {
        this._data[name] = value;
    }

    getData(name: string): any {
        return this._data[name];
    }

    public createSet(name: string) {
        const set = new CounterSet(name, this);

        for (let counter of this._counters) {
            set.add(counter.create());
        }

        return set;
    }

    _onCounterUpdated(counter: Counter) {
        this.counterUpdated.emit(counter);
    }

    private retrieve(): CounterSet[] {
        const sets: CounterSet[] = [this._counterSetAll];

        if (this._activity) {
            sets.push(this._counterSetLast);
        }

        return sets;
    }

    updateCounter(proto: Counter, value: any, inc: boolean) {
        for (let set of this.retrieve()) {
            set.updateCounter(proto, value, inc);
        }
    }

    incCounter(proto: Counter) {
        for (let set of this.retrieve()) {
            set.incCounter(proto);
        }
    }

    decCounter(proto: Counter) {
        for (let set of this.retrieve()) {
            set.decCounter(proto);
        }
    }

    resetCounter(proto: Counter) {
        for (let set of this.retrieve()) {
            set.resetCounter(proto);
        }
    }

    findActiveSetByName(name: string) {
        for (let counterSet of this._sets) {
            if (counterSet.name == name) {
                return counterSet;
            }
        }

        return null;
    }

    createActivity() {
        return new Activity(this.createSet("activity"))
    }
}
