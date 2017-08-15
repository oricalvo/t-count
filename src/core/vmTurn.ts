import {CounterSet} from "./counterSet";

export class VmTurn {
    id: number;
    counters: CounterSet;

    static nextId: number = 0;

    constructor(counters: CounterSet) {
        this.id = ++VmTurn.nextId;
        this.counters = counters;
    }
}
