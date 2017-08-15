import {Counter} from "../core/counter";

export class SetTimeoutCounter extends Counter {
  constructor() {
    super("setTimeout");
  }

  patch() {
      this.profile(window, "setTimeout");

      return [this];
  }
}
