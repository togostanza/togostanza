import debounce from 'lodash.debounce';
import outdent from 'outdent';

import AboutLinkElement from './about-link.mjs';
import Stanza from './stanza.mjs';

export function defineStanzaElement(main, {metadata, templates, outer, url}) {
  const id        = metadata['@id'];
  const paramKeys = metadata['stanza:parameter'].map(param => param['stanza:key']);

  class StanzaElement extends HTMLElement {
    static get observedAttributes() {
      return [...paramKeys, 'togostanza-about-link-placement'];
    }

    constructor() {
      super(...arguments);

      this.renderDebounced = debounce(() => {
        this.render();
      }, 50);

      ensureOuterInserted(id, outer);
      ensureAboutLinkElementDefined();

      this.attachShadow({mode: 'open'});

      this.stanza = new Stanza(this, metadata, templates, url);

      applyDefaultStyles(this, metadata['stanza:style']);
    }

    connectedCallback() {
      this.renderDebounced.flush();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'togostanza-about-link-placement') {
        this.stanza.setAboutLinkPlacement(newValue);
      } else {
        this.renderDebounced();
      }
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

function ensureAboutLinkElementDefined() {
  const aboutLinkName = 'togostanza-about-link';
  if (!customElements.get(aboutLinkName)) {
    customElements.define(aboutLinkName, AboutLinkElement);
  }
}
