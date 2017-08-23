import {Profiler} from "../core/profiler";
import {CountersViewer} from "./counters.view";
import {View} from "../util/view";
import "./profiler.view.scss";
import template from "./profiler.view.html";
import {getElement} from "../util/domHelpers";

export class ProfilerViewer extends View {
    private profiler: Profiler;
    private toolbar: HTMLElement;
    private visible: boolean;
    private activeChild: View;
    private activeButton: Element;

    private constructor(element: HTMLElement) {
        super(element, <any>template);
    }

    static create(profiler: Profiler, selector: string): ProfilerViewer;
    static create(profiler: Profiler, element: HTMLElement): ProfilerViewer;
    static create(profiler: Profiler, selectorOrElement: string|HTMLElement): ProfilerViewer {
        let viewer;

        if(typeof selectorOrElement == "string") {
            viewer = new ProfilerViewer(getElement(document, selectorOrElement));
        }
        else {
            viewer = new ProfilerViewer(selectorOrElement);
        }

        viewer.bind(profiler);

        return viewer;
    }

    bind(profiler: Profiler) {
        this.profiler = profiler;

        this.initShortcut();

        this.render();
    }

    render() {
        super.render();

        this.renderToolbar();

        this.visible = localStorage.getItem("angularProfiler.visible") == "true";
        this.updateVisibility();

        const activeChildName = localStorage.getItem("angularProfiler.activeSet");
        const activeButton = getElement(this.element, "button[data-name=" + activeChildName + "]");
        this.activateChild(activeButton, false);
    }

    private getAttachedView(element: any) {
        const view = element["view"];
        if(!view) {
            throw new Error("No attached view");
        }

        return view;
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

    private activateChild(button: HTMLElement, saveToLocalStorage: boolean) {
        if(this.activeChild) {
            this.activeChild.element.classList.remove("active");
        }

        if(this.activeButton) {
            this.activeButton.classList.remove("active");
        }

        const view = this.getAttachedView(button);
        this.activeChild = view;
        this.activeButton = button;

        if(this.activeChild) {
            this.activeChild.element.classList.add("active");
        }

        if(this.activeButton) {
            this.activeButton.classList.add("active");
        }

        if(saveToLocalStorage) {
            localStorage.setItem("angularProfiler.activeSet", <string>button.getAttribute("data-name"));
        }
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
        this.activateChild(button, true);
    }
}

