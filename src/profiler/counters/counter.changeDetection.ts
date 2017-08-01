import {ApplicationRef} from '@angular/core';
import {Counter} from "../core/counter";
import {Profiler} from "../core/profiler";

export class PerfCountChangeDetection extends Counter {
  constructor() {
    super("Change Detection")
  }

  onAddedAsProto(profiler: Profiler) {
    super.onAddedAsProto(profiler);

    const applicationRef: ApplicationRef = profiler.getData("applicationRef");
    this.profile(applicationRef, "tick");
  }
}

export function create() {
  return new PerfCountChangeDetection();
}


