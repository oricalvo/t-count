import {CounterSet} from "./counterSet";

export class Activity {
    counters: CounterSet;

    constructor(counters: CounterSet) {
        this.counters = counters;
    }
}
