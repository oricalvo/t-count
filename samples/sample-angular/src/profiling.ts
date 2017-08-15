import {Profiler, CounterXHR, ProfilerViewer, CounterSetTimeout} from "t-count";
import {CounterChangeDetection} from "t-count-angular";

export const counters = {
  xhr: new CounterXHR(),
  setTimeout: new CounterSetTimeout(),
  changeDetection: new CounterChangeDetection(),
};

export const profiler = new Profiler();
profiler.init(counters);

export const profilerViewer = ProfilerViewer.fromSelector("profiler");
profilerViewer.bind(profiler);
