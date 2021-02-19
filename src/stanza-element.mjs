import debounce from 'lodash.debounce';
import outdent from 'outdent';

import AboutLinkElement from './elements/togostanza-about-link.mjs';
import ContainerElement from './elements/togostanza-container.mjs';
import Stanza from './stanza.mjs';

export async function defineStanzaElement({stanzaModule, metadata, templates, css, url}) {
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

      ensureBuiltinElementsDefined();


      this.attachShadow({mode: 'open'});

      this.stanza = new Stanza(this, metadata, templates, url);
      this.stanzaModule = stanzaModule;

      const hostStyle = document.createElement('style');
      hostStyle.append(cssVariableDefaults(metadata['stanza:style']) || '');
      this.append(hostStyle);

      const shadowStyle = document.createElement('style');
      shadowStyle.append(css || '');
      this.shadowRoot.append(shadowStyle);

      // if (stanzaModule.handleEvent) {
      //   // XXX
      //   this.addEventListener("hover", stanzaModule.handleEvent);
      // }
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

      stanzaModule.default(this.stanza, params);
    }
  }

  customElements.define(`togostanza-${id}`, StanzaElement);
}

function cssVariableDefaults(defs) {
  if (!defs) { return null; }

  return outdent`
    :root {
    ${defs.map(def => `  ${def['stanza:key']}: ${def['stanza:default']};`).join('\n')}
    }
  `;
}

function ensureBuiltinElementsDefined() {
  for (const el of [AboutLinkElement, ContainerElement]) {
    if (!customElements.get(el.customElementName)) {
      customElements.define(el.customElementName, el);
    }
  }
}
