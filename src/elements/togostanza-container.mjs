import get from 'lodash.get';

export default class ContainerElement extends HTMLElement {
  dataSourceUrls = [];

  connectedCallback() {
    setTimeout(() => { // wait until stanzas ready
      const stanzaElements = Array.from(
        this.querySelectorAll('*')
      ).filter((el) => el.tagName.startsWith('TOGOSTANZA-') && 'stanza' in el);

      connectStanzasWithAttributes(this, stanzaElements);
      connectStanzasWithHandler(stanzaElements);
      connectDataSource(this);
    }, 0);
  }

  disconnectedCallback() {
    for (const url of this.dataSourceUrls) {
      URL.revokeObjectURL(url);
    }
  }
}

ContainerElement.customElementName = 'togostanza-container';

function connectStanzasWithHandler(stanzaElements) {
  for (const srcEl of stanzaElements) {
    for (const eventName of outgoingEventNames(srcEl.stanza)) {
      srcEl.addEventListener(eventName, (event) => {
        for (const destEl of stanzaElements) {
          if (incomingEventNames(destEl.stanza).includes(eventName)) {
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

async function connectDataSource(container) {
  for (const sourceElement of container.querySelectorAll('togostanza-data-source')) {
    const url             = sourceElement.getAttribute('url');
    const receiver        = sourceElement.getAttribute('receiver');
    const targetAttribute = sourceElement.getAttribute('target-attribute');

    const receiverElements = container.querySelectorAll(receiver);

    const blob = await fetch(url).then(res => res.blob());
    const objectUrl = URL.createObjectURL(blob);

    container.dataSourceUrls.push(objectUrl);

    setEach(receiverElements, targetAttribute, objectUrl);
  }
}

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