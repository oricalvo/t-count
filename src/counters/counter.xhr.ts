import {Counter} from "../core/counter";

export class XHRCounter extends Counter {
    constructor() {
        super("XHR")
    }

    patch() {
        const me = this;

        const send = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function() {
            const xhr = this;

            if (!(<any>xhr)["profiler_patched"]) {
                (<any>xhr)["profiler_patched"] = true;

                //
                //  loadstart is raised just before HTTP request is sent
                //
                xhr.addEventListener("loadstart", onLoadStart);
                xhr.addEventListener("readystatechange", onReadyStateChange);
            }

            me.inc();

            return send.apply(xhr, arguments);
        }

        function onReadyStateChange(this: XMLHttpRequest) {
            const xhr = this;

            if(xhr.readyState == 2) {
                const before = (<any>xhr)["profiler_send"];
                if (before) {
                    const after = performance.now();
                    me.update(after - before, false);
                }
            }
        }

        function onLoadStart(this: XMLHttpRequest) {
            const xhr = <any>this;

            xhr["profiler_send"] = performance.now();
        }

        return [this];
    }
}
