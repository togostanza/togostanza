import debounce from 'lodash.debounce';
import outdent from 'outdent';

import Stanza from './stanza.mjs';

export function defineStanzaElement(main, {metadata, templates, outer}) {
  const id        = metadata['@id'];
  const paramKeys = metadata['stanza:parameter'].map(param => param['stanza:key']);

  class StanzaElement extends HTMLElement {
    static get observedAttributes() {
      return paramKeys;
    }

    constructor() {
      super(...arguments);

      this.renderDebounced = debounce(() => {
        this.render();
      }, 50);

      ensureOuterInserted(id, outer);
      ensureAboutLinkElementDefined();

      this.attachShadow({mode: "open"});

      this.stanza = new Stanza(this, metadata, templates);

      applyDefaultStyles(this, metadata['stanza:style']);
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
  }

  customElements.define(`togostanza-${id}`, StanzaElement);
}

function applyDefaultStyles(el, defs) {
  if (!defs) { return; }

  const style = document.createElement('style');

  style.textContent = outdent`
    :root {
    ${defs.map(def => `  ${def['stanza:key']}: ${def['stanza:default']};`).join('\n')}
    }
  `;

  el.append(style);
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

class AboutLinkElement extends HTMLElement {
  constructor() {
    super(...arguments);

    this.attachShadow({mode: "open"});

    const href = this.attributes.href.textContent;
    if (!href) {
      return;
    }

    const style = document.createElement("style");
    style.textContent = `:host {
      position: absolute;
      bottom: 0;
      right: 0;
      background-color: white;
      opacity: 0.5;
      transition: opacity 0.2s ease-in-out;
    }

    :host(:hover) {
      opacity: 0.8;
    }

    a {
      text-decoration: none;
      padding: 0.2rem 0.5rem;
    }
    `;

    const anchor = document.createElement("a");
    anchor.innerHTML = this.innerHTML || "About this stanza";
    anchor.href = href;

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(anchor);
  }
}

function ensureAboutLinkElementDefined() {
  customElements.define(`togostanza-about-link`, AboutLinkElement);
}
