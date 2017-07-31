import {PerfCounter} from "./counter";
import * as xhr from "./counter.xhr";
import {CounterSet} from "./counterSet";

export const counterThunk = new PerfCounter("Thunk");
export const counterAction = new PerfCounter("Reducer");

export const perfCounterMiddleware = store => next => action => {

  function exec() {
    const before = performance.now();

    const retVal = next(action);

    const after = performance.now();
    counterAction.update(after-before);

    if (typeof action == "function" && retVal && retVal.then) {
      retVal.then(function () {
        const after = performance.now();
        counterThunk.update(after - before);
      }, function () {
        const after = performance.now();
        counterThunk.update(after - before);
      });
    }

    return retVal;
  }

  return counterThunk.hub.run(exec);
}

export function create() {
  return [
    counterThunk,
    counterAction,
  ];
}
