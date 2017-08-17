import {getElement} from "./domHelpers";

export class View {
    private _element: HTMLElement;

    constructor(element: HTMLElement, private template: string) {
        this._element = element;

        (<any>this._element)["view"] = this;
    }

    get element() {
        return this._element;
    }

    render() {
        this.element.innerHTML = this.template;
    }

    getChildElement(selector: string) {
        return getElement(this.element, selector);
    }

    hide() {
        this.element.classList.add("hide");
    }

    show() {
        this.element.classList.remove("hide");
    }

    static fromElement(element: HTMLElement): View {
        const view: View = (<any>element)["view"];
        if(!view) {
            throw new Error("The specified element has no attached View");
        }

        return view;
    }
}
