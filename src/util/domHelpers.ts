export function getElement(parent: NodeSelector, selector: string): HTMLElement {
    const child = parent.querySelector(selector);
    if(!child) {
        throw new Error("Selector: " + selector + " was not found");
    }

    return <HTMLElement>child;
}
