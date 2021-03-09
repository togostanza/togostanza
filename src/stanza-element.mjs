import debounce from 'lodash.debounce';
import outdent from 'outdent';

import AboutLinkElement from './elements/togostanza-about-link.mjs';
import ContainerElement from './elements/togostanza-container.mjs';
import DataSourceElement from './elements/togostanza-data-source.mjs';
import Stanza from './stanza.mjs';

export async function defineStanzaElement({stanzaModule, metadata, templates, css, url}) {
  const id        = metadata['@id'];
  const paramKeys = metadata['stanza:parameter'].map(param => param['stanza:key']);

  class StanzaElement extends HTMLElement {
    constructor() {
      super(...arguments);

      this.renderDebounced = debounce(() => {
        this.render();
      }, 50);

      ensureBuiltinElementsDefined();

      this.attachShadow({mode: 'open'});

      const handleEvent = (event) => {
        stanzaModule.handleEvent?.(this.stanza, this.params, event);
      };

      this.stanza = new Stanza(this, metadata, templates, url, handleEvent);
    }

    connectedCallback() {
      const hostStyle = document.createElement('style');
      hostStyle.append(cssVariableDefaults(metadata['stanza:style']) || '');
      this.append(hostStyle);

      const shadowStyle = document.createElement('style');
      shadowStyle.append(css || '');
      this.shadowRoot.append(shadowStyle);

      this.renderDebounced();
      this.renderDebounced.flush();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'togostanza-about-link-placement') {
        this.stanza.setAboutLinkPlacement(newValue);
        return;
      }
      if (stanzaModule.handleAttributeChange) {
        stanzaModule.handleAttributeChange(this.stanza, this.params, name, oldValue, newValue);
      } else {
        this.renderDebounced();
      }
    }

    get params() {
      return Object.fromEntries(
        metadata['stanza:parameter'].map((param) => {
          const key = param['stanza:key'];
          const type = param['stanza:type'];

          if (type === 'boolean') {
            return [key, this.attributes.hasOwnProperty(key)];
          }

          const valueStr = this.attributes[key]?.value;

          if (valueStr === null || valueStr === undefined) {
            return [key, valueStr];
          }

          let value;

          switch (type) {
            case 'number':
              value = Number(valueStr);
              break;
            case 'date':
            case 'datetime':
              value = Date.parse(valueStr);
              break;
            case 'json':
              value = JSON.parse(valueStr);
              break;
            default:
              value = valueStr;
          }

          return [key, value];
        })
      );
    }

    render() {
      stanzaModule.default(this.stanza, this.params);
    }
  }

  StanzaElement.observedAttributes = [...paramKeys, 'togostanza-about-link-placement'];

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
  for (const el of [AboutLinkElement, ContainerElement, DataSourceElement]) {
    const name = el.customElementName;

    if (!customElements.get(name)) {
      customElements.define(name, el);
    }
  }
}
