import {Counter} from "../core/counter";
import * as xhr from "./counter.xhr";
import {CounterSet} from "../core/counterSet";

export const counterThunk = new Counter("Thunk");
export const counterAction = new Counter("Reducer");

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

  return counterThunk.profiler.run(exec);
}

export function create() {
  return [
    counterThunk,
    counterAction,
  ];
}
