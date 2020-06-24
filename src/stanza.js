import HandlebarsRuntime from '~handlebars/runtime';

class Stanza {
  constructor(root, metadata, templates) {
    this.root      = root;
    this.main      = document.createElement('main');
    this.metadata  = metadata;
    this.templates = templates;

    this.root.appendChild(this.main);
  }

  render(params) {
    const template = HandlebarsRuntime.template(this.templates[params.template]);
    const html     = template(params.parameters);

    this.main.innerHTML = html;
  }

  select(selector) {
    return this.main.querySelector(selector);
  }

  importWebFontCSS(url) {
    const el = document.createElement('link');

    el.rel  = 'stylesheet';
    el.type = 'text/css';
    el.href = url;

    document.head.appendChild(el);
    this.root.appendChild(el.cloneNode());
  }
}

export function defineStanzaElement(main, {metadata, templates, outer}) {
  const id = metadata["@id"];

  class StanzaElement extends HTMLElement {
    constructor() {
      super(...arguments);

      ensureOuterInserted(id, outer);

      const root   = this.attachShadow({mode: "open"});
      const stanza = new Stanza(root, metadata, templates);
      const params = Object.fromEntries(Array.from(this.attributes).map(({name, value}) => [name, value]));

      main(stanza, params);
    }
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

// TODO check attribute updates
