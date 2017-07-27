import {ApplicationRef} from '@angular/core';
import {PerfCounter} from "./counter";
import {PerfCounterHub} from "../hub";

export class PerfCountChangeDetection extends PerfCounter {
  constructor() {
    super("Change Detection")
  }

  onAddedAsProto(hub: PerfCounterHub) {
    super.onAddedAsProto(hub);

    const applicationRef: ApplicationRef = hub.getData("applicationRef");
    this.profile(applicationRef, "tick");
  }
}

export function create() {
  return new PerfCountChangeDetection();
}


