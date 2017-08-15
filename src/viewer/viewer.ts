import {Profiler} from "../core/profiler";
import {CountersViewer} from "./counters";
import {View} from "../util/view";
import "./viewer.scss";
import template from "./viewer.html";
import {getElement} from "../util/domHelpers";

export class ProfilerViewer extends View {
    private profiler: Profiler;
    private toolbar: HTMLElement;
    private countersAll: CountersViewer;
    private buttonAll: HTMLElement;
    private countersLast: CountersViewer;
    private buttonLast: HTMLElement;
    private visible: boolean;
    private activeChild: View;
    private activeChildName: string|null;
    private activeButton: Element;

    private constructor(element: HTMLElement) {
        super(element, <any>template);
    }

    static fromElement(element: HTMLElement) {
        return new ProfilerViewer(element);
    }

    static fromSelector(selector: string) {
        return new ProfilerViewer(getElement(document, selector));
    }

    bind(profiler: Profiler) {
        this.profiler = profiler;

        this.initShortcut();
        this.initSettingsFromLocalStorage();

        this.render();
    }

    render() {
        super.render();

        this.toolbar = this.getChildElement(".toolbar");

        this.countersAll = new CountersViewer(this.profiler, this.getChildElement("profiler-counters.all"));
        this.countersAll.bind(this.profiler.all);
        this.buttonAll = this.getChildElement("button.all");
        this.buttonAll.addEventListener("click", this.activateChild.bind(this, this.countersAll, this.buttonAll));

        this.countersLast = new CountersViewer(this.profiler, this.getChildElement("profiler-counters.last"));
        this.countersLast.bind(this.profiler.last);
        this.buttonLast = this.getChildElement("button.last");
        this.buttonLast.addEventListener("click", this.activateChild.bind(this, this.countersLast, this.buttonLast));

        this.renderFooter();

        if (this.activeChildName=="all") {
            this.activateChild(this.countersAll, this.buttonAll);
        }
        else if(this.activeChildName=="last"){
            this.activateChild(this.countersLast, this.buttonLast);
        }
        else {
            this.activateChild(this.countersAll, this.buttonAll);
        }
    }

    private toggleVisibility() {
        this.visible = !this.visible;

        this.updateVisibility();

        localStorage.setItem("angularProfiler.visible", this.visible + "");
    }

    private updateVisibility() {
        if (this.visible) {
            this.element.classList.add("active");
        }
        else {
            this.element.classList.remove("active");
        }
    }

    private activateChild(child: View, button: HTMLElement) {
        if(this.activeChild) {
            this.activeChild.element.classList.remove("active");
        }

        if(this.activeButton) {
            this.activeButton.classList.remove("active");
        }

        this.activeChild = child;
        this.activeButton = button;

        if(this.activeChild) {
            this.activeChild.element.classList.add("active");
        }

        if(this.activeButton) {
            this.activeButton.classList.add("active");
        }

        localStorage.setItem("angularProfiler.activeSet", (child==this.countersAll ? "all" : "last"));
    }

    // private activateSet(counterSet: CounterSet) {
    //     this.activeSet = counterSet;
    //     this.render();
    //
    //     const button = this.buttons.find(b => b["counterSet"] == this.activeSet);
    //     if (button) {
    //         this.switchButton(button);
    //     }
    //
    //     localStorage.setItem("angularProfiler.activeSet", this.activeSet.name);
    // }

    private switchButton(button: HTMLElement) {
        if (this.activeButton) {
            this.activeButton.classList.remove("active");
        }

        this.activeButton = button;
        this.activeButton.classList.add("active");
    }

    // private reset() {
    //     if (this.activeSet) {
    //         this.activeSet.reset();
    //     }
    // }

    private renderFooter() {
        // const buttonReset = getElement(this.element, ".footer button.reset");
        // buttonReset.addEventListener("click", this.reset.bind(this));
    }

    private initShortcut() {
        document.addEventListener("keydown", (e) => {
            if (e.code == "KeyH" && e.shiftKey && e.ctrlKey) {
                this.toggleVisibility();
            }
        });
    }

    private initSettingsFromLocalStorage() {
        this.visible = localStorage.getItem("angularProfiler.visible") == "true";
        this.updateVisibility();

        this.activeChildName = localStorage.getItem("angularProfiler.activeSet");
    }
}

