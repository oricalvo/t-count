import {Counter} from "./counter";
import {CounterSet} from "./counterSet";
import {ProfilerZone} from "./profilerZone";
import {Activity} from "./activity";
import {ActivityZone} from "./activityZone";
import {VmTurn} from "./vmTurn";
import {EventEmitter} from "../util/eventEmitter";
import {appLogger} from "./logger";

if (typeof Zone == 'undefined') {
    throw new Error('angular-profiler requires Zone.js prolyfill.');
}

const logger = appLogger.create("Profiler");

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

    init(counters: Counter[]) {
        for (let counter of counters) {
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
        logger("ENTER VmTurn").log();

        this._vmTurn = new VmTurn(this.createSet("vmTurn"));
    }

    private onLeaveVmTurn() {
        logger("LEAVE VmTurn").log();

        this._vmTurn = null;
    }

    private onEvent(task: Task) {
        logger("EVENT", task).log();

        if(task.source.indexOf("addEventListener:click")!=-1) {
            this._counterSetLast.reset();

            this._activity = new Activity(this._counterSetLast);
        }
    }

    private onStartActivity(activity: Activity) {
        logger("START Activity").log();
    }

    private onFinishActivity(activity: Activity) {
        logger("FINISH Activity").log();
    }

    private onEnterActivity(activity: Activity) {
        logger("ENTER Activity").log();
    }

    private onLeaveActivity(activity: Activity) {
        logger("LEAVE Activity").log();
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

    static create(types: Type<Counter>[]) {
        const profiler = new Profiler();

        const counters = types.map(type => new type());
        profiler.init(counters);

        return profiler;
    }

    get<T>(type: Type<T>): T {
        for(let counter of this._counters) {
            if(counter instanceof type) {
                return <any>counter;
            }
        }

        throw new Error("Counter of type " + type.name + " was not found");
    }
}

export interface Type<T> extends Function {
    new (...args: any[]): T;
}
