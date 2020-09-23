import debounce from 'lodash.debounce';
import outdent from 'outdent';

import AboutLinkElement from './about-link.mjs';
import Stanza from './stanza.mjs';

export async function defineStanzaElement(main, {metadata, templates, css, url}) {
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

      ensureAboutLinkElementDefined();

      this.attachShadow({mode: 'open'});

      this.stanza = new Stanza(this, metadata, templates, url);

      const hostStyle = document.createElement('style');
      hostStyle.append(cssVariableDefaults(metadata['stanza:style']) || '');
      this.append(hostStyle);

      const shadowStyle = document.createElement('style');
      shadowStyle.append(css || '');
      this.shadowRoot.append(shadowStyle);
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

function cssVariableDefaults(defs) {
  if (!defs) { return null; }

  return outdent`
    :root {
    ${defs.map(def => `  ${def['stanza:key']}: ${def['stanza:default']};`).join('\n')}
    }
  `;
}

function ensureAboutLinkElementDefined() {
  const aboutLinkName = 'togostanza-about-link';
  if (!customElements.get(aboutLinkName)) {
    customElements.define(aboutLinkName, AboutLinkElement);
  }
}
