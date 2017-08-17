import {Profiler} from "../core/profiler";
import {CountersViewer} from "./counters";
import {View} from "../util/view";
import "./viewer.scss";
import template from "./viewer.html";
import {getElement} from "../util/domHelpers";

export class ProfilerViewer extends View {
    private profiler: Profiler;
    private toolbar: HTMLElement;
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

        this.renderToolbar();

        const activeButton = getElement(this.element, "button[data-name=" + this.activeChildName + "]");
        this.activateChild(activeButton)

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

    private switchButton(button: HTMLElement) {
        if (this.activeButton) {
            this.activeButton.classList.remove("active");
        }

        this.activeButton = button;
        this.activeButton.classList.add("active");
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

    private renderToolbar() {
        this.toolbar = this.getChildElement(".toolbar");

        const countersAll = new CountersViewer(this.profiler, this.getChildElement("profiler-counters.all"));
        countersAll.bind(this.profiler.all);

        const countersLast = new CountersViewer(this.profiler, this.getChildElement("profiler-counters.last"));
        countersLast.bind(this.profiler.last);

        const buttonAll = this.getChildElement("button.all");
        buttonAll.addEventListener("click", this.onButtonClicked.bind(this));
        (<any>buttonAll)["view"] = countersAll;

        const buttonLast = this.getChildElement("button.last");
        buttonLast.addEventListener("click", this.onButtonClicked.bind(this));
        (<any>buttonLast)["view"] = countersLast;
    }

    private onButtonClicked(event: Event) {
        const button: HTMLElement = <HTMLElement>event.target;

        const view: View = (<any>button)["view"];
        if(view) {
            this.activateChild(view, button);
        }
    }
}

