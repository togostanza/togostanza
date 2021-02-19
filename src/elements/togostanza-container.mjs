export default class ContainerElement extends HTMLElement {
  constructor() {
    super(...arguments);

    console.log("ContainerElement initialized");
  }

  // TODO consider nested container case
  connectedCallback() {
    console.log("ContainerElement connectedCallback");
    setTimeout(() => {
    const stanzaElements = Array.from(this.querySelectorAll("*")).filter(el => el.tagName.startsWith("TOGOSTANZA-"));
    for (const srcEl of stanzaElements) {
        console.log("EV", srcEl, srcEl.stanza);
        for (const eventName of srcEl.stanza.metadata.eventNames || []) {
          srcEl.addEventListener(eventName, (event) => {
            const clonedEvent = new event.constructor(event.type, event);
            this.dispatchEvent(clonedEvent);
          });
          console.log("REGISTERING", eventName, srcEl)
            this.addEventListener(eventName, (event) => {
              console.log("RECEIVED EVENT ON CONTAINER", event);
                for (const destEl of stanzaElements) {
                  // TODO skip srcEl === destEl
                    console.log("BROADCASTING", event)
                    //destEl.addEventListener(clonedEvent);
                    destEl.stanzaModule.handleEvent(event);
                }
            })
        }
    }}, 0);
  }

  foo = "bar";
}

ContainerElement.customElementName = "togostanza-container";
