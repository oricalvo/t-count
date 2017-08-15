import {getElement} from "./domHelpers";

export class View {
    private _element: HTMLElement;

    constructor(element: HTMLElement, private template: string) {
        this._element = element;
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
}
