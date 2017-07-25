import {PerfCounter} from "./counter";

let counter = new PerfCounter("XHR", {noAvg: true, noLastValue: true});;

export function patch() {
  counter.profile(XMLHttpRequest.prototype, "send");
}

export function create() {
  return counter;
}
