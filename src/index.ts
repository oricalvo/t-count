import {CounterXHR} from "./counters/counter.xhr";
import {CounterSetTimeout} from "./counters/counter.setTimeout";
import {Counter} from "./core/counter";
import {Profiler} from "./core/profiler";
import {ProfilerViewer} from "./viewer/profiler.view";

export {Profiler} from "./core/profiler";
export {Counter} from "./core/counter";
export {ProfilerViewer} from "./viewer/profiler.view";
export {appLogger as logger} from "./core/logger";
export {CounterXHR} from "./counters/counter.xhr";
export {CounterSetTimeout} from "./counters/counter.setTimeout";

export const BROWSER_COUNTERS = [
    CounterXHR,
    CounterSetTimeout,
];
