import {Counter} from "./counter";
import {Profiler} from "./profiler";

export class CounterSet {
  _name: string;
  _map: {[name: string]: Counter};
  _arr: Counter[];

  constructor(name: string, public profiler: Profiler) {
    this._name = name;
    this._map = {};
    this._arr = [];
  }

  get name() {
    return this._name;
  }

  add(counter: Counter) {
    if(this._map[counter.name]) {
      throw new Error("Counter: " + counter.name + " already exist");
    }

    this._map[counter.name] = counter;
    this._arr.push(counter);

    counter.onAddedToSet(this);
  }

  find(name: string) {
    return this._map[name];
  }

  reset() {
    for(let counter of this._arr) {
      counter.reset();
    }
  }

  getOrCreate(name: string) {
    let counter = this._map[name];
    if(!counter) {
      counter = this._map[name] = new Counter(name);
    }

    return counter;
  }

  get all() {
    return this._arr;
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
