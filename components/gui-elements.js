class WindowElement extends HTMLElement {
    static get observedAttributes() { return ['src']; }
    async attributeChangedCallback(name, oldValue, newValue) {
        name === 'src' && oldValue !== newValue && (Object.assign(this, await import(src)));
    };
    connectedCallback() {

    };
}