import {CounterSet} from "../core/counterSet";
import {Profiler} from "../core/profiler";
import {Counter} from "../core/counter";
import {View} from "../util/view";
import {getElement} from "../util/domHelpers";
import "./counters.view.scss";
import template from "./counters.view.html";

export class CountersViewer extends View {
    ul: HTMLElement;
    counterTemplate: HTMLElement;
    counters: CounterSet;

    constructor(private profiler: Profiler, element: HTMLElement) {
        super(element, <any>template);

        profiler.counterUpdated.subscribe(this.onCounterUpdated.bind(this));
    }

    bind(counters: CounterSet) {
        this.counters = counters;

        this.render();
    }

    render() {
        super.render();

        this.ul = getElement(this.element, "ul");

        this.counterTemplate = getElement(this.element, "li");
        if(this.counterTemplate.parentElement) {
            this.counterTemplate.parentElement.removeChild(this.counterTemplate);
        }

        getElement(this.element, "button.reset").addEventListener("click", this.reset.bind(this));

        if (!this.counters) {
            return;
        }

        for (let counter of this.counters.all) {
            this.addCounter(counter);
        }
    }

    private reset() {
        this.counters.reset();
    }

    private addCounter(counter: Counter) {
        const li: HTMLElement = this.counterTemplate.cloneNode(true) as HTMLElement;
        this.renderCounter(li, counter, true);
        (<any>counter)["view"] = li;
        this.ul.appendChild(li);
    }

    private renderCounter(li: HTMLElement, counter: Counter, firstTime: boolean) {
        if (firstTime) {
            const name: HTMLElement = li.querySelector(".name") as HTMLElement;
            name.innerText = counter.name;
        }

        this.renderStat(li, ".count", counter.count);
        this.renderStat(li, ".avg", counter.avg);
        this.renderStat(li, ".last-value", counter.lastValue);
        this.renderStat(li, ".sum", counter.sum);

        return li;
    }

    private renderStat(li: HTMLElement, selector: string, value: number) {
        const elem: HTMLElement = li.querySelector(selector) as HTMLElement;
        if (elem == null) {
            throw new Error("Selector: " + selector + " was not found");
        }

        if (value == undefined || value == 0) {
            elem.innerHTML = "&nbsp";
        }
        else {
            elem.innerText = this.round(value).toString();
        }
    }

    private round(num: number) {
        if (num > 100) {
            return Math.round(num);
        }

        if (num > 10) {
            return Math.round(num * 10) / 10;
        }

        return Math.round(num * 100) / 100;
    }

    private onCounterAdded(counter: Counter) {
        if (counter.set != this.counters) {
            return;
        }

        this.addCounter(counter);
    }

    private onCounterUpdated(counter: Counter) {
        const li = (<any>counter)["view"];
        if (!li) {
            this.onCounterAdded(counter);
            return;
        }

        this.renderCounter(li, counter, false);
    }
}

