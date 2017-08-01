import {Counter} from "./counter";
import {Profiler} from "./profiler";

export class CounterSet {
  map: {[name: string]: Counter};
  arr: Counter[];

  constructor(private name: string, public profiler: Profiler) {
    this.map = {};
    this.arr = [];
  }

  add(counter: Counter) {
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
      counter = this.map[name] = new Counter(name);
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

  updateCounter(proto: Counter, value: any, inc: boolean) {
    const counter = this.get(proto.name);
    counter.update(value, inc);
  }

  incCounter(proto: Counter) {
    const counter = this.get(proto.name);
    counter.inc();
  }

  decCounter(proto: Counter) {
    const counter = this.get(proto.name);
    counter.dec();
  }

  resetCounter(proto: Counter) {
    const counter = this.get(proto.name);
    counter.reset();
  }
}
