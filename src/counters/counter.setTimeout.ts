import {Counter} from "../core/counter";

export class CounterSetTimeout extends Counter {
  constructor() {
    super("setTimeout", {noAvg: true, noLastValue: true});
  }

  patch() {
      this.profile(window, "setTimeout");

      return [this];
  }
}
