import {Counter} from "../core/counter";

export class CounterRedux extends Counter {
    counterThunk = new Counter("Thunk");
    counterAction = new Counter("Reducer");
    middleware;

    constructor() {
        super("Redux");

        this.middleware = this.createMiddleware();
    }

    patch() {
        return [
            this.counterThunk,
            this.counterAction,
        ];
    }

    private createMiddleware() {
        const me = this;

        const perfCounterMiddleware = store => next => action => {
            function exec() {
                const before = performance.now();

                const retVal = next(action);

                const after = performance.now();
                me.counterAction.update(after - before);

                if (typeof action == "function" && retVal && retVal.then) {
                    retVal.then(function () {
                        const after = performance.now();
                        me.counterThunk.update(after - before);
                    }, function () {
                        const after = performance.now();
                        me.counterThunk.update(after - before);
                    });
                }

                return retVal;
            }

            return me.counterThunk._profiler.run(exec);
        }

        return perfCounterMiddleware;
    }
}
