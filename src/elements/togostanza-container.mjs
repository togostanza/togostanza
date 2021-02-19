export default class ContainerElement extends HTMLElement {
  constructor() {
    super(...arguments);

    console.log("ContainerElement initialized");
  }


  connectedCallback() {
    console.log("ContainerElement connectedCallback");
    setTimeout(() => {
    const stanzaElements = Array.from(this.querySelectorAll("*")).filter(el => el.tagName.startsWith("TOGOSTANZA-"));
    for (const srcEl of stanzaElements) {
        console.log("EV", srcEl.foo, srcEl, srcEl.stanza);
        for (eventName of srcEl.stanza.metadata.eventNames || []) {
            this.addEventListener(eventName, (event) => {
                for (const destEl of stanzaElements) {
                    // TODO skip srcEl === destEl
                    destEl.dispatchEvent(event);
                }
            })
        }
    }}, 1000);
  }

  foo = "bar";
}

ContainerElement.customElementName = "togostanza-container";
