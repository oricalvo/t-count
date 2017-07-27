import {PerfCounterHub} from "../hub";

export interface PerfCounterOptions {
  noAvg?: boolean;
  noLastValue?: boolean;
}

export class CounterSet {
  map: {[name: string]: PerfCounter};
  arr: PerfCounter[];

  constructor(private name: string, public hub: PerfCounterHub) {
    this.map = {};
    this.arr = [];
  }

  add(counter: PerfCounter) {
    if(this.map[counter.name]) {
      throw new Error("Counter: " + counter.name + " already exist");
    }

    this.map[counter.name] = counter;
    this.arr.push(counter);

    counter.onAddedToSet(this);
  }

  find(name: string) {
    return this.map[name];
  }

  reset() {
    for(let counter of this.arr) {
      counter.reset();
    }
  }

  getOrCreate(name: string) {
    let counter = this.map[name];
    if(!counter) {
      counter = this.map[name] = new PerfCounter(name);
    }

    return counter;
  }

  get all() {
    return this.arr;
  }

  get(name: string) {
    const counter = this.find(name);
    if(!counter) {
      throw new Error("Counter with name: " + name + " was not found");
    }

    return counter;
  }
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

  private retrieve(): PerfCounter[] {
    const stats: PerfCounter[] = [this.hub.globalSet.get(this.name)];

    const zoneCounters: CounterSet = Zone.current.get("counterSet");
    if(zoneCounters) {
      const counter = zoneCounters.getOrCreate(this.name);
      stats.push(counter);
    }

    return stats;
  }

  public clone() {
    return new PerfCounter(this.name, this.options);
  }

  private isProto() {
    return this.set == null;
  }

  update(value) {
    if(this.isProto()) {
      for (let stat of this.retrieve()) {
        stat.update(value);
      }
    }
    else {
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
  }

  inc() {
    if (this.isProto()) {
      for (let stat of this.retrieve()) {
        stat.inc();
      }
    }
    else {
      this.count++;

      this.onUpdated();
    }
  }

  dec() {
    if (this.isProto()) {
      for (let stat of this.retrieve()) {
        stat.dec();
      }
    }
    else {
      this.count--;

      this.onUpdated();
    }
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
      for (let stat of this.retrieve()) {
        stat.reset();
      }
    }
    else {
      this.count = 0;
      this.lastValue = undefined;
      this.avg = undefined;
      this.sum = undefined;

      this.onUpdated();
    }
  }
}
