import template from "./viewer.html";
import {Logger} from "complog";
import {CounterSet} from "../core/counterSet";
import {Profiler} from "../core/profiler";
import {Counter} from "../core/counter";

const logger = Logger.create("PerfCounterViewer");

export class PerfCounterViewer {
  ul: HTMLElement;
  counterTemplate: HTMLElement;
  activeButton: Element;
  activeSet: CounterSet;
  buttonAll: HTMLButtonElement;
  buttonLast: HTMLButtonElement;
  buttons: HTMLElement[];
  visible: boolean;

  constructor(private profiler: Profiler, private element: HTMLElement) {
    element.innerHTML = template;

    this.counterTemplate = element.querySelector("li");
    this.counterTemplate.parentElement.removeChild(this.counterTemplate);

    this.ul = this.element.querySelector("ul");

    profiler.counterUpdated.subscribe(this.onCounterUpdated.bind(this));
    profiler.activityStarted.subscribe(this.onActivityStarted.bind(this));

    this.initToolbar();
    this.initFooter();
    this.initShortcut();
    this.initSettingsFromLocalStorage();
  }

  private initToolbar() {
    const toolbar = this.element.querySelector(".toolbar");
    if(!toolbar) {
      throw new Error("Toolbar was not found");
    }

    this.buttons = [];
    for(let set of this.profiler.sets) {
      const button = document.createElement("button");
      button.innerText = this.pascalCase(set.name);
      button.classList.add(set.name);
      button.addEventListener("click", this.activateSet.bind(this, set));
      button["counterSet"] = set;
      this.buttons.push(button);

      toolbar.appendChild(button);
    }
  }

  private toggleVisibility() {
    this.visible = !this.visible;

    this.updateVisibility();

    localStorage.setItem("angularProfiler.visible", this.visible + "");
  }

  private updateVisibility() {
    if(this.visible) {
      this.element.classList.add("active");
    }
    else {
      this.element.classList.remove("active");
    }
  }

  private activateSet(counterSet: CounterSet) {
    this.activeSet = counterSet;
    this.render();

    const button = this.buttons.find(b=>b["counterSet"]==this.activeSet);
    if(button) {
      this.switchButton(button);
    }

    localStorage.setItem("angularProfiler.activeSet", this.activeSet.name);
  }

  private switchButton(button) {
    if(this.activeButton) {
      this.activeButton.classList.remove("active");
    }

    this.activeButton = button;
    this.activeButton.classList.add("active");
  }

  private render() {
    this.ul.innerHTML = "";

    if(!this.activeSet) {
      return;
    }

    for (let counter of this.activeSet.all) {
      this.addCounter(counter);
    }
  }

  private addCounter(counter: Counter) {
    const li: HTMLElement = this.counterTemplate.cloneNode(true) as HTMLElement;
    this.renderCounter(li, counter, true);
    counter["view"] = li;
    this.ul.appendChild(li);
  }

  private renderCounter(li: HTMLElement, counter: Counter, firstTime: boolean) {
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

  private pascalCase(str) {
    const ch = str[0].toUpperCase();

    return ch + str.substring(1);
  }

  private round(num: number) {
    if(num > 100) {
      return Math.round(num);
    }

    if(num > 10) {
      return Math.round(num * 10) / 10;
    }

    return Math.round(num * 100) / 100;
  }

  private onCounterAdded(counter: Counter) {
    if(counter.set != this.activeSet) {
      return;
    }

    this.addCounter(counter);
  }

  private onCounterUpdated(counter: Counter) {
    const li = counter["view"];
    if(!li) {
      this.onCounterAdded(counter);
      return;
    }

    this.renderCounter(li, counter, false);
  }

  private onActivityStarted(counterSet: CounterSet) {
    if(this.activeSet.name == "last") {
      this.render();
    }
  }

  private reset() {
    if(this.activeSet) {
      this.activeSet.reset();
    }
  }

  private initFooter() {
    const buttonReset = <HTMLButtonElement>this.element.querySelector(".footer button.reset");
    buttonReset.addEventListener("click", this.reset.bind(this));
  }

  private initShortcut() {
    document.addEventListener("keydown", (e) => {
      if(e.code == "KeyH" && e.shiftKey && e.ctrlKey) {
        this.toggleVisibility();
      }
    });
  }

  private initSettingsFromLocalStorage() {
    this.visible = localStorage.getItem("angularProfiler.visible") == "true";
    this.updateVisibility();

    const activeSetName = localStorage.getItem("angularProfiler.activeSet");
    let activeSet = null;
    if(activeSetName) {
      activeSet = this.profiler.findActiveSetByName(activeSetName);
    }
    if(!activeSet) {
      activeSet = this.profiler.all;
    }

    this.activateSet(activeSet);
  }
}

