import {EventEmitter} from "@angular/core";
import {PerfCounter} from "./counters/counter";

export class PerfCounterHub {
  counters: PerfCounter[];
  data: {};

  counterAdded: EventEmitter<PerfCounter> = new EventEmitter<PerfCounter>();
  counterUpdated: EventEmitter<PerfCounter> = new EventEmitter<PerfCounter>();

  constructor() {
    this.counters = [];
    this.data = {};
  }

  addCounter(counter: PerfCounter) {
    this.counters.push(counter);

    this.counterAdded.emit(counter);

    counter._onAdded(this);
  }

  setData(name: string, value: any) {
    this.data[name] = value;
  }

  getData(name: string): any {
    return this.data[name];
  }

  _onCounterUpdated(counter: PerfCounter) {
    this.counterUpdated.emit(counter);
  }

  reset() {
    for(let counter of this.counters) {
      counter.reset();
    }
  }
}
