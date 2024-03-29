import outdent from 'outdent';

import MenuElement from './elements/togostanza--menu.mjs';
import ContainerElement from './elements/togostanza--container.mjs';
import DataSourceElement from './elements/togostanza--data-source.mjs';

export async function defineStanzaElement({
  stanzaModule,
  metadata,
  templates,
  url,
}) {
  const id = metadata['@id'];
  const paramKeys = metadata['stanza:parameter'].map(
    (param) => param['stanza:key']
  );

  class StanzaElement extends HTMLElement {
    constructor() {
      super(...arguments);

      ensureBuiltinElementsDefined();

      this.attachShadow({ mode: 'open' });

      this.stanzaInstance = new stanzaModule.default(
        this,
        metadata,
        templates,
        url
      );
    }

    connectedCallback() {
      const hostStyle = document.createElement('style');
      hostStyle.append(cssVariableDefaults(metadata['stanza:style']) || '');
      this.shadowRoot.append(hostStyle);

      const shadowStyleLink = document.createElement('link');
      shadowStyleLink.rel = 'stylesheet';
      shadowStyleLink.href = url.replace(/\.js$/, '.css');
      this.shadowRoot.append(shadowStyleLink);

      this.stanzaInstance.renderDebounced();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'togostanza-menu_placement') {
        this.stanzaInstance.menuElement.setAttribute(
          'placement',
          newValue || metadata['stanza:menu-placement']
        );
      }
      this.stanzaInstance.handleAttributeChange(name, oldValue, newValue);
    }

    render() {
      this.stanzaInstance.render();
    }
  }

  StanzaElement.observedAttributes = [
    ...paramKeys,
    'togostanza-menu_placement',
  ];

  customElements.define(`togostanza-${id}`, StanzaElement);
}

function cssVariableDefaults(defs) {
  if (!defs) {
    return null;
  }

  return outdent`
    :host {
    ${defs
      .map((def) => `  ${def['stanza:key']}: ${def['stanza:default']};`)
      .join('\n')}
    }
  `;
}

function ensureBuiltinElementsDefined() {
  for (const el of [MenuElement, ContainerElement, DataSourceElement]) {
    const name = el.customElementName;

    if (!customElements.get(name)) {
      customElements.define(name, el);
    }
  }
}
