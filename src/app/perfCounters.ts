import * as components from "../profiler/counters/counter.components";
import * as xhr from "../profiler/counters/counter.xhr";
import * as changeDetection from "../profiler/counters/counter.changeDetection";
import * as redux from "../profiler/counters/counter.redux";
import * as timers from "../profiler/counters/counter.timers";

components.patch();
xhr.patch();
timers.patch();

export const perfCounters = [
  changeDetection.create,
  components.create,
  xhr.create,
  redux.create,
  timers.create,
];
