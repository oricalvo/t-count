import {PerfCounter} from "./counter";

export const counterThunk = new PerfCounter("Thunk");
export const counterAction = new PerfCounter("Reducer");

export const perfCounterMiddleware = store => next => action => {
  let before = performance.now();

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
