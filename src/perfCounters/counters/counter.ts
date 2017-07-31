import {PerfCounterHub} from "../hub";
import {CounterSet} from "./counterSet";

export interface PerfCounterOptions {
  noAvg?: boolean;
  noLastValue?: boolean;
}

export class PerfCounter {
  hub: PerfCounterHub;
  set: CounterSet;
  lastValue: any;
  avg: any;
  sum: any;
  count: number;
  options: PerfCounterOptions;

  constructor(public name: string, options?: PerfCounterOptions) {
    this.options = options || {};
    this.count = 0;
  }

  profile(obj, methodName: string) {
    const me = this;
    const original = obj[methodName];

    obj[methodName] = function() {
      const before = performance.now();

      const retVal = original.apply(this, arguments);

      const after = performance.now();

      const time = after - before;

      me.update(time);

      return retVal;
    }
  }

  execAndUpdate(func) {
    const before = performance.now();

    const retVal = func();

    const after = performance.now();

    this.update(after-before);

    return retVal;
  }

  public clone() {
    return new PerfCounter(this.name, this.options);
  }

  private isProto() {
    return this.set == null;
  }

  update(value) {
    if(this.isProto()) {
      this.hub.updateCounter(this, value);
      return;
    }

    if(!this.options.noLastValue) {
      this.lastValue = value;
    }

    if(!this.options.noAvg) {
      if (this.sum == undefined) {
        this.sum = value;
      }
      else {
        this.sum += value;
      }
    }

    ++this.count;

    if(!this.options.noAvg) {
      this.avg = this.sum / this.count;
    }

    this.onUpdated();
  }

  inc() {
    if (this.isProto()) {
      this.hub.incCounter(this);
      return;
    }

    this.count++;

    this.onUpdated();
  }

  dec() {
    if (this.isProto()) {
      this.hub.decCounter(this);
      return;
    }

    this.count--;

    this.onUpdated();
  }

  private onUpdated() {
    if(this.set) {
      this.set.hub._onCounterUpdated(this);
    }
  }

  onAddedAsProto(hub: PerfCounterHub) {
    this.hub = hub;
  }

  onAddedToSet(set: CounterSet) {
    this.set = set;
    this.hub = set.hub;
  }

  reset() {
    if(this.isProto()) {
      this.hub.resetCounter(this);
      return;
    }

    this.count = 0;
    this.lastValue = undefined;
    this.avg = undefined;
    this.sum = undefined;

    this.onUpdated();
  }
}
