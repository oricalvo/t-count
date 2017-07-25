import {PerfCounterHub} from "../hub";
import {PerfCounter} from "../counters/counter";
import template from "./viewer.html";
import {Logger} from "complog";

const logger = Logger.create("PerfCounterViewer");

export class PerfCounterViewer {
  ul: HTMLElement;
  counterTemplate: HTMLElement;

  constructor(private profiler: PerfCounterHub, private element: HTMLElement) {
    element.innerHTML = template;

    this.counterTemplate = element.querySelector("li");
    this.counterTemplate.parentElement.removeChild(this.counterTemplate);

    this.ul = this.element.querySelector("ul");

    profiler.counterAdded.subscribe(this.onCounterAdded.bind(this));
    profiler.counterUpdated.subscribe(this.onCounterUpdated.bind(this));
  }

  private render() {
    this.ul.innerHTML = "";

    for(let counter of this.profiler.counters) {
      this.addCounter(counter);
    }
  }

  private addCounter(counter: PerfCounter) {
    const li: HTMLElement = this.counterTemplate.cloneNode(true) as HTMLElement;
    this.renderCounter(li, counter);
    counter["view"] = li;
    this.ul.appendChild(li);
  }

  private renderCounter(li: HTMLElement, counter: PerfCounter) {
    const name: HTMLElement = li.querySelector(".name") as HTMLElement;
    name.innerText = counter.name;

    const count: HTMLElement = li.querySelector(".count") as HTMLElement;
    if(counter.count!==undefined) {
      count.innerText = counter.count.toString();
    }
    else {
      count.innerText = "";
    }

    const avg: HTMLElement = li.querySelector(".avg") as HTMLElement;
    if(counter.avg!==undefined) {
      avg.innerText = this.round(counter.avg).toString();
    }
    else {
      avg.innerText = "";
    }

    const lastValue: HTMLElement = li.querySelector(".last-value") as HTMLElement;
    if(counter.lastValue!==undefined) {
      lastValue.innerText = this.round(counter.lastValue).toString();
    }
    else {
      lastValue.innerText = "";
    }

    return li;
  }

  private round(num: number) {
    return Math.round(num * 100) / 100;
  }

  private onCounterAdded(counter: PerfCounter) {
    //logger.log("onCounterAdded", counter);

    this.addCounter(counter);
  }

  private onCounterUpdated(counter: PerfCounter) {
    //logger.log("onCounterUpdated", counter);

    const li = counter["view"];
    if(!li) {
      this.onCounterAdded(counter);
      return;
    }

    this.renderCounter(li, counter)
  }
}

