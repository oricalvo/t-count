import * as components from "../profiler/counters/counter.components";
import * as xhr from "../profiler/counters/counter.xhr";
import * as changeDetection from "../profiler/counters/counter.changeDetection";
import * as redux from "../profiler/counters/counter.redux";

components.patch();
xhr.patch();

export const perfCounters = [
  changeDetection.create,
  components.create,
  xhr.create,
  redux.create,
];
