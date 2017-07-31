import {PerfCounterHub} from "../hub";
import {PerfCounter} from "./counter";

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

  updateCounter(proto: PerfCounter, value: any) {
    const counter = this.get(proto.name);
    counter.update(value);
  }

  incCounter(proto: PerfCounter) {
    const counter = this.get(proto.name);
    counter.inc();
  }

  decCounter(proto: PerfCounter) {
    const counter = this.get(proto.name);
    counter.dec();
  }

  resetCounter(proto: PerfCounter) {
    const counter = this.get(proto.name);
    counter.reset();
  }
}
