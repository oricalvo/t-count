import * as components from "../perfCounters/counters/counter.components";
import * as xhr from "../perfCounters/counters/counter.xhr";
import * as changeDetection from "../perfCounters/counters/counter.changeDetection";
import * as redux from "../perfCounters/counters/counter.redux";

components.patch();
xhr.patch();

export const perfCounters = [
  changeDetection.create,
  components.create,
  xhr.create,
  redux.create,
];
