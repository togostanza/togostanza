import get from 'lodash.get';

export default class ContainerElement extends HTMLElement {
  dataSourceUrls = {};

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
    for (const entry of Object.values(this.dataSourceUrls)) {
      URL.revokeObjectURL(entry.value);
    }
  }

  async dataSourceUrlChanged(oldUrl, newUrl, receiver, targetAttribute) {
    this.disposeDataSourceUrl(oldUrl);

    const receiverElements = this.querySelectorAll(receiver);

    if (newUrl) {
      const objectUrl = await this.getOrCreateObjectUrl(newUrl);

      setEach(receiverElements, targetAttribute, objectUrl);
    } else {
      removeEach(receiverElements, targetAttribute);
    }
  }

  async getOrCreateObjectUrl(url) {
    const entry = this.dataSourceUrls[url];

    if (entry) {
      entry.count++;
      return entry.value;
    }

    const blob      = await fetch(url).then(res => res.blob());
    const objectUrl = URL.createObjectURL(blob);

    this.dataSourceUrls[url] = {
      value: objectUrl,
      count: 1
    };

    return objectUrl;
  }

  disposeDataSourceUrl(url) {
    const entry = this.dataSourceUrls[url];

    if (!entry) { return; }

    entry.count--;

    if (entry.count === 0) {
      URL.revokeObjectURL(entry.value);

      delete this.dataSourceUrls[url];
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
        } else if (value.constructor === String) { // a bit weird, but a unified way to determine string literals and objects
          setEach(receiverElements, targetAttribute, value);
        } else {
          setEach(receiverElements, targetAttribute, JSON.stringify(value));
        }
      });
    }
  }
}

function connectDataSource(container) {
  for (const dataSource of container.querySelectorAll('togostanza-data-source')) {
    dataSource.containerElement = container;

    const url             = dataSource.getAttribute('url');
    const receiver        = dataSource.getAttribute('receiver');
    const targetAttribute = dataSource.getAttribute('target-attribute');

    container.dataSourceUrlChanged(null, url, receiver, targetAttribute);
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
