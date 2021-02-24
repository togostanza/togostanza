export default class ContainerElement extends HTMLElement {
  constructor() {
    super(...arguments);

    console.log("ContainerElement initialized");
  }

  // TODO consider nested container case
  connectedCallback() {
    console.log("ContainerElement connectedCallback");
    setTimeout(() => {
      const stanzaElements = Array.from(
        this.querySelectorAll("*")
      ).filter((el) => el.tagName.startsWith("TOGOSTANZA-"));

      // src -> container
      const eventNames = new Set();
      for (const srcEl of stanzaElements) {
        console.log("EV", srcEl, srcEl.stanza);
        for (const eventName of srcEl.stanza.metadata.eventNames || []) {
          eventNames.add(eventName);
          // TODO skip if event is already registers
          srcEl.addEventListener(eventName, (event) => {
            const clonedEvent = new event.constructor(event.type, event);
            clonedEvent.srcElement = srcEl;
            this.dispatchEvent(clonedEvent);
          });
        }
      }

      // container -> dest
      for (const eventName of eventNames) {
        // destEl の metadata を見て必要なイベントだけをhandleさせる
        console.log("container->dest", eventName);
        this.addEventListener(eventName, (event) => {
          for (const destEl of stanzaElements) {
            // TODO skip srcEl === destEl
            console.log("BROADCASTING", event);
            destEl.stanza.handleEvent(event);
          }
        });
      }
    }, 0);
  }
}

ContainerElement.customElementName = "togostanza-container";
