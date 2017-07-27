import {PerfCounterHub} from "../hub";
import {CounterSet, PerfCounter} from "../counters/counter";
import template from "./viewer.html";
import {Logger} from "complog";

const logger = Logger.create("PerfCounterViewer");

export class PerfCounterViewer {
  ul: HTMLElement;
  counterTemplate: HTMLElement;
  activeButton: Element;
  activeSet: CounterSet;
  activeSetIsLast: boolean;
  buttonAll: HTMLButtonElement;
  buttonLast: HTMLButtonElement;

  constructor(private hub: PerfCounterHub, private element: HTMLElement) {
    element.innerHTML = template;

    this.counterTemplate = element.querySelector("li");
    this.counterTemplate.parentElement.removeChild(this.counterTemplate);

    this.ul = this.element.querySelector("ul");

    hub.counterUpdated.subscribe(this.onCounterUpdated.bind(this));
    hub.activityStarted.subscribe(this.onActivityStarted.bind(this));

    this.buttonAll = <HTMLButtonElement>this.element.querySelector(".toolbar button.all");
    this.buttonAll.addEventListener("click", this.activateAll.bind(this));

    this.buttonLast = <HTMLButtonElement>this.element.querySelector(".toolbar button.last");
    this.buttonLast.addEventListener("click", this.activateLast.bind(this));

    const buttonReset = <HTMLButtonElement>this.element.querySelector(".footer button.reset");
    buttonReset.addEventListener("click", this.reset.bind(this));

    this.activeSet = null;
    this.activeSetIsLast = false;

    this.activateAll();

    document.addEventListener("keydown", (e) => {
      console.log("KeyDown", e);

      if(e.code == "KeyH" && e.shiftKey && e.ctrlKey) {
        this.element.classList.toggle("active");
      }
    });
  }

  private activateAll() {
    this.render(this.hub.globalSet);
    this.activeSetIsLast = false;
    this.switchButton(this.buttonAll);
  }

  private activateLast() {
    this.render(this.hub.lastSet);
    this.activeSetIsLast = true;
    this.switchButton(this.buttonLast);
  }

  private switchButton(button) {
    if(this.activeButton) {
      this.activeButton.classList.remove("active");
    }

    this.activeButton = button;
    this.activeButton.classList.add("active");
  }

  private render(activeSet: CounterSet) {
    this.ul.innerHTML = "";
    this.activeSet = activeSet;

    if(activeSet) {
      for (let counter of activeSet.all) {
        this.addCounter(counter);
      }
    }
  }

  private addCounter(counter: PerfCounter) {
    const li: HTMLElement = this.counterTemplate.cloneNode(true) as HTMLElement;
    this.renderCounter(li, counter, true);
    counter["view"] = li;
    this.ul.appendChild(li);
  }

  private renderCounter(li: HTMLElement, counter: PerfCounter, firstTime: boolean) {
    if(firstTime) {
      const name: HTMLElement = li.querySelector(".name") as HTMLElement;
      name.innerText = counter.name;
    }

    this.renderStat(li, ".count", counter.count);
    this.renderStat(li, ".avg", counter.avg);
    this.renderStat(li, ".last-value", counter.lastValue);
    this.renderStat(li, ".sum", counter.sum);

    return li;
  }

  private renderStat(li, selector, value) {
    const elem: HTMLElement = li.querySelector(selector) as HTMLElement;
    if(elem == null) {
      throw new Error("Selector: " + selector + " was not found");
    }

    if(value==undefined || value==0) {
      elem.innerHTML = "&nbsp";
    }
    else {
      elem.innerText = this.round(value).toString();
    }
  }

  private round(num: number) {
    return Math.round(num * 100) / 100;
  }

  private onCounterAdded(counter: PerfCounter) {
    if(counter.set != this.activeSet) {
      return;
    }

    this.addCounter(counter);
  }

  private onCounterUpdated(counter: PerfCounter) {
    const li = counter["view"];
    if(!li) {
      this.onCounterAdded(counter);
      return;
    }

    this.renderCounter(li, counter, false);
  }

  private onActivityStarted(counterSet: CounterSet) {
    if(this.activeSetIsLast) {
      this.render(counterSet);
    }
  }

  private reset() {
    if(this.activeSet) {
      this.activeSet.reset();
    }
  }
}

