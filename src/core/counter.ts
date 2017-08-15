import {Profiler} from "./profiler";
import {CounterSet} from "./counterSet";

export interface CounterOptions {
    noAvg?: boolean;
    noLastValue?: boolean;
}

export class Counter {
    private _name: string;
    private _profiler: Profiler;
    private _set: CounterSet;
    private _lastValue: any;
    private _avg: any;
    private _sum: any;
    private _count: number;
    private _options: CounterOptions;

    constructor(name: string, options?: CounterOptions) {
        this._name = name;
        this._options = options || {};
        this._count = 0;
    }

    patch(): Counter[] {
        return [this];
    }

    public create(): Counter {
        return new Counter(this._name, this._options);
    }

    profile(obj: any, methodName: string) {
        const me = this;
        const original = obj[methodName];

        obj[methodName] = function () {
            const before = performance.now();

            const retVal = original.apply(this, arguments);

            const after = performance.now();

            const time = after - before;

            me.update(time);

            return retVal;
        }
    }

    execAndUpdate(func: Function) {
        const before = performance.now();

        const retVal = func();

        const after = performance.now();

        this.update(after - before);

        return retVal;
    }

    private isProto() {
        return this._set == null;
    }

    update(value: any, inc: boolean = true) {
        if (!this._profiler) {
            return;
        }

        if (this.isProto()) {
            this._profiler.updateCounter(this, value, inc);
            return;
        }

        if (!this._options.noLastValue) {
            this._lastValue = value;
        }

        if (!this._options.noAvg) {
            if (this._sum == undefined) {
                this._sum = value;
            }
            else {
                this._sum += value;
            }
        }

        if (inc) {
            ++this._count;
        }

        if (!this._options.noAvg) {
            this._avg = this._sum / this._count;
        }

        this.onUpdated();
    }

    inc() {
        if (!this._profiler) {
            return;
        }

        if (this.isProto()) {
            this._profiler.incCounter(this);
            return;
        }

        this._count++;

        this.onUpdated();
    }

    dec() {
        if (!this._profiler) {
            return;
        }

        if (this.isProto()) {
            this._profiler.decCounter(this);
            return;
        }

        this._count--;

        this.onUpdated();
    }

    private onUpdated() {
        if (this._set) {
            this._set.profiler._onCounterUpdated(this);
        }
    }

    onRegistered(profiler: Profiler) {
        this._profiler = profiler;
    }

    onCreate(set: CounterSet) {
        this._profiler = set.profiler;
        this._set = set;
    }

    reset() {
        if (this.isProto()) {
            this._profiler.resetCounter(this);
            return;
        }

        this._count = 0;
        this._lastValue = undefined;
        this._avg = undefined;
        this._sum = undefined;

        this.onUpdated();
    }

    get count() {
        return this._count;
    }

    get avg() {
        return this._avg;
    }

    get lastValue() {
        return this._lastValue;
    }

    get sum() {
        return this._sum;
    }

    get set() {
        return this._set;
    }

    get name() {
        return this._name;
    }
}
