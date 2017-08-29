export function getElement(parent: NodeSelector, selector: string): HTMLElement {
    const child = parent.querySelector(selector);
    if(!child) {
        throw new Error("Selector: " + selector + " was not found");
    }

    return <HTMLElement>child;
}

export function removeElement(element: HTMLElement) {
    const parent = element.parentElement;

    if(!parent) {
        throw new Error("No parent element");
    }

    parent.removeChild(element);
}
