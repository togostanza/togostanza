export default class ContainerElement extends HTMLElement {
  connectedCallback() {
    setTimeout(() => {
      const stanzaElements = Array.from(
        this.querySelectorAll("*")
      ).filter((el) => el.tagName.startsWith("TOGOSTANZA-") && "stanza" in el);

      for (const srcEl of stanzaElements) {
        for (const eventName of srcEl.stanza.metadata.eventNames || []) {
          srcEl.addEventListener(eventName, (event) => {
            for (const destEl of stanzaElements) {
              if (srcEl !== destEl) {
                destEl.stanza.handleEvent(event);
              }
            }
          });
        }
      }
    }, 0);
  }
}

ContainerElement.customElementName = "togostanza-container";
