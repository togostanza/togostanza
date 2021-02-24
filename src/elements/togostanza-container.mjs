export default class ContainerElement extends HTMLElement {
  connectedCallback() {
    setTimeout(() => {
      const stanzaElements = Array.from(
        this.querySelectorAll("*")
      ).filter((el) => el.tagName.startsWith("TOGOSTANZA-") && "stanza" in el);

      for (const srcEl of stanzaElements) {
        const outgoingEventNames = srcEl.stanza.metadata["stanza:outgoingEvents"]?.map(e => e['stanza:key']) || [];
        for (const eventName of outgoingEventNames) {
          srcEl.addEventListener(eventName, (event) => {
            for (const destEl of stanzaElements) {
              const incomingEventNames = srcEl.stanza.metadata["stanza:incomingEvents"]?.map(e => e['stanza:key']) || [];
              if (incomingEventNames.includes(eventName)) {
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
