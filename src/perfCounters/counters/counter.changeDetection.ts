import {ApplicationRef} from '@angular/core';
import {PerfCounter} from "./counter";
import {PerfCounterHub} from "../hub";

export class PerfCountChangeDetection extends PerfCounter {
  constructor() {
    super("Change Detection")
  }

  _onAdded(hub: PerfCounterHub) {
    super._onAdded(hub);

    const applicationRef: ApplicationRef = hub.getData("applicationRef");
    this.profile(applicationRef, "tick");
  }
}

export function create() {
  return new PerfCountChangeDetection();
}


