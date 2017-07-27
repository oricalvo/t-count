import {EventEmitter} from "@angular/core";
import {CounterSet, PerfCounter} from "./counters/counter";
import {createScope} from "@angular/core/src/profile/wtf_impl";

export class PerfCounterHub {
  private counters: PerfCounter[];
  private global: CounterSet;
  private last: CounterSet;
  private data: {};

  //counterAdded: EventEmitter<PerfCounter> = new EventEmitter<PerfCounter>();
  activityStarted: EventEmitter<CounterSet> = new EventEmitter<CounterSet>();
  counterUpdated: EventEmitter<PerfCounter> = new EventEmitter<PerfCounter>();

  constructor() {
    this.counters = [];
    this.data = {};
    this.global = null;
  }

  init(counters: PerfCounter[]) {
    for(let counter of counters) {
      this.add(counter);
    }

    this.global = this.createSet("global");
    this.last = this.createSet("last");
  }

  setData(name: string, value: any) {
    this.data[name] = value;
  }

  getData(name: string): any {
    return this.data[name];
  }

  add(counter: PerfCounter) {
    this.counters.push(counter);

    counter.onAddedAsProto(this);
  }

  onActivityStarted() {
    this.last = this.createSet("last");

    this.activityStarted.emit(this.last);

    return this.last;
  }

  get globalSet() {
    if(!this.global) {
      this.global = this.createSet("global");
    }

    return this.global;
  }

  get lastSet() {
    return this.last;
  }

  private createSet(name: string) {
    const set = new CounterSet(name, this);

    for(let counter of this.counters) {
      set.add(counter.clone());
    }

    return set;
  }

  _onCounterUpdated(counter: PerfCounter) {
    this.counterUpdated.emit(counter);
  }
}
