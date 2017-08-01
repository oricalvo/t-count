import {Counter} from "../core/counter";

const counter = new Counter("XHR");

export function patch() {
  const send = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.send = function() {
    const xhr = this;
    const before = performance.now();

    function onload() {
      const after = performance.now();

      counter.update(after-before);

      xhr.removeEventListener("load", onload);
    }

    xhr.addEventListener("load", onload);

    return send.apply(xhr, arguments);
  }

  //counter.profile(XMLHttpRequest.prototype, "send");
}

export function create() {
  return counter;
}
