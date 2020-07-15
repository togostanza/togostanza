import debounce from '-system/lodash.debounce';

import Stanza from './stanza.mjs';

export function defineStanzaElement(main, {metadata, templates, outer}) {
  const id        = metadata['@id'];
  const paramKeys = metadata['stanza:parameter'].map(param => param['stanza:key']);

  class StanzaElement extends HTMLElement {
    static observedAttributes = paramKeys;

    constructor() {
      super(...arguments);

      ensureOuterInserted(id, outer);

      const root = this.attachShadow({mode: "open"});

      this.stanza = new Stanza(root, metadata, templates);
    }

    connectedCallback() {
      this.renderDebounced.flush();
    }

    attributeChangedCallback() {
      this.renderDebounced();
    }

    render() {
      const params = Object.fromEntries(
        Array.from(this.attributes).map(({name, value}) => [name, value])
      );

      main(this.stanza, params);
    }

    renderDebounced = debounce(() => {
      this.render();
    }, 50);
  }

  customElements.define(`togostanza-${id}`, StanzaElement);
}

function ensureOuterInserted(id, outer) {
  if (!outer) { return; }
  if (document.querySelector(`[data-togostanza-outer="${id}"]`)) { return; }

  const outerEl = document.createElement('div');

  outerEl.setAttribute('data-togostanza-outer', id);
  outerEl.innerHTML = outer;

  document.body.append(outerEl);

  outerEl.querySelectorAll('script').forEach((orig) => {
    const el = document.createElement('script');

    el.textContent = orig.textContent;

    Array.from(orig.attributes).forEach((attr) => {
      el.setAttribute(attr.nodeName, attr.textContent);
    });

    orig.replaceWith(el);
  });
}
