import {Profiler, ProfilerViewer, CounterSetTimeout, logger} from "t-count";
import {CounterChangeDetection, CounterHttp, CounterXHR, CounterComponents} from "t-count-angular";

export const counters = {
  xhr: new CounterXHR(),
  setTimeout: new CounterSetTimeout(),
  changeDetection: new CounterChangeDetection(),
  http: new CounterHttp(),
  components: new CounterComponents(),
};

export const profiler = new Profiler();
profiler.init(counters);

export const profilerViewer = ProfilerViewer.fromSelector("profiler");
profilerViewer.bind(profiler);

logger.enable(false);
