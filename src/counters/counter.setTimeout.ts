import {Counter} from "../core/counter";

export class CounterSetTimeout extends Counter {
  constructor() {
    super("setTimeout");
  }

  patch() {
      this.profile(window, "setTimeout");

      return [this];
  }
}
