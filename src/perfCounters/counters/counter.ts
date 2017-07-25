import {PerfCounterHub} from "../hub";

export interface PerfCounterOptions {
  noAvg?: boolean;
  noLastValue?: boolean;
}

export class PerfCounter {
  lastValue: any;
  avg: any;
  sum: any;
  count: number;
  hub: PerfCounterHub;
  options: PerfCounterOptions;

  constructor(public name: string, options?: PerfCounterOptions) {
    this.count = 0;
    this.options = options || {};
  }

  profile(obj, methodName: string) {
    const me = this;
    const original = obj[methodName];

    obj[methodName] = function() {
      const before = performance.now();

      const retVal = original.apply(this, arguments);

      const after = performance.now();

      me.update(after-before);

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

  update(value) {
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

  private onUpdated() {
    if(this.hub) {
      this.hub._onCounterUpdated(this);
    }
  }

  inc() {
    this.count++;

    this.onUpdated();
  }

  dec() {
    this.count--;

    this.onUpdated();
  }

  _onAdded(hub: PerfCounterHub) {
    this.hub = hub;
  }

  reset() {
    this.count = 0;
    this.lastValue = undefined;
    this.avg = undefined;
    this.sum = undefined;

    this.onUpdated();
  }
}
