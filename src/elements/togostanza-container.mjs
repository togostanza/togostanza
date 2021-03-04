import get from 'lodash.get';

function connectStanzasWithHandler(stanzaElements) {
  for (const srcEl of stanzaElements) {
    for (const eventName of outgoingEventNames(srcEl.stanza)) {
      srcEl.addEventListener(eventName, (event) => {
        for (const destEl of stanzaElements) {
          if (incomingEventNames(srcEl.stanza).includes(eventName)) {
            destEl.stanza.handleEvent(event);
          }
        }
      });
    }
  }
}

function connectStanzasWithAttributes(container, stanzaElements) {
  for (const mapElement of container.querySelectorAll('togostanza-event-map')) {
    const on              = mapElement.getAttribute('on');
    const receiver        = mapElement.getAttribute('receiver');
    const targetAttribute = mapElement.getAttribute('target-attribute');
    const valuePath       = mapElement.getAttribute('value-path');

    const receiverElements = container.querySelectorAll(receiver);

    for (const srcEl of stanzaElements) {
      if (!outgoingEventNames(srcEl.stanza).includes(on)) { continue; }

      srcEl.addEventListener(on, (event) => {
        const value = valuePath ? get(event.detail, valuePath) : event.detail;

        if (value === true) {
          setEach(receiverElements, targetAttribute, '');
        } else if (value === false || value === undefined) {
          removeEach(receiverElements, targetAttribute);
        } else if (value instanceof String) {
          setEach(receiverElements, targetAttribute, value);
        } else {
          setEach(receiverElements, targetAttribute, JSON.stringify(value));
        }
      });
    }
  }
}

export default class ContainerElement extends HTMLElement {
  connectedCallback() {
    const stanzaElements = Array.from(
      this.querySelectorAll('*')
    ).filter((el) => el.tagName.startsWith('TOGOSTANZA-') && 'stanza' in el);

    setTimeout(() => { // wait until stanzas ready
      connectStanzasWithAttributes(this, stanzaElements);
      connectStanzasWithHandler(stanzaElements)
    }, 0);
  }
}

ContainerElement.customElementName = 'togostanza-container';

function setEach(elements, key, value) {
  for (const el of elements) {
    el.setAttribute(key, value);
  }
}

function removeEach(elements, key) {
  for (const el of elements) {
    el.removeAttribute(key);
  }
}

function outgoingEventNames(stanza) {
  return stanza.metadata['stanza:outgoingEvent']?.map(e => e['stanza:key']) || [];
}

function incomingEventNames(stanza) {
  return stanza.metadata['stanza:incomingEvent']?.map(e => e['stanza:key']) || [];
}