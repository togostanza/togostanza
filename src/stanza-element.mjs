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
      line-height: 16px;
    }

    :host(:hover) {
      opacity: 0.8;
    }

    a {
      text-decoration: none;
      padding: 0.2rem 0.5rem;
    }

    .label {
      display: none;
    }

    :host(:hover) .label {
      display: inline;
    }
    `;

    const infoIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z"></path></svg>`;

    const anchor = document.createElement("a");
    anchor.innerHTML = this.innerHTML || infoIcon + '<span class="label">About this stanza</span>';
    anchor.href = href;

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(anchor);
  }
}

function ensureAboutLinkElementDefined() {
  customElements.define(`togostanza-about-link`, AboutLinkElement);
}
