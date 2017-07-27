import {CounterSet, PerfCounter} from "./counter";
import * as xhr from "./counter.xhr";

export const counterThunk = new PerfCounter("Thunk");
export const counterAction = new PerfCounter("Reducer");

export const perfCounterMiddleware = store => next => action => {
  let retVal;
  let before;

  let perfCounters = Zone.current.get("counterSet");
  if (!perfCounters) {
    const counterSet: CounterSet = counterThunk.hub.onActivityStarted();

    const spec: ZoneSpec = {
      name: "redux-counters",
      properties: {
        "counterSet": counterSet,
      },
    };

    const zone = Zone.current.fork(spec);

    retVal = zone.run(function () {
      before = performance.now();
      const retVal = next(action);

      if(typeof action == "function" && retVal && retVal.then) {
        retVal.then(function() {
          const after = performance.now();
          counterThunk.update(after-before);
        }, function() {
          const after = performance.now();
          counterThunk.update(after-before);
        });
      }

      return retVal;
    });
  }
  else {
    before = performance.now();
    retVal = next(action);

    if(typeof action == "function" && retVal && retVal.then) {
      retVal.then(function() {
        const after = performance.now();
        counterThunk.update(after-before);
      }, function() {
        const after = performance.now();
        counterThunk.update(after-before);
      });
    }
  }

  const after = performance.now();
  counterAction.update(after-before);

  return retVal;
}

export function create() {
  return [
    counterThunk,
    counterAction,
  ];
}
