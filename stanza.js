class Stanza {
  constructor(root, metadata) {
    this.root     = root;
    this.metadata = metadata;
  }

  render(params) {
    const template = require(`provider/${this.metadata["@id"]}/templates/${params.template}`);
    const html     = template(params.parameters);

    this.root.innerHTML = html;
  }

  select(selector) {
    return this.root.querySelector(selector);
  }
}

export default function(init) {
  class StanzaElement extends HTMLElement {
    constructor() {
      super(...arguments);

      ensureOuterInserted();

      const root   = this.attachShadow({mode: "open"});
      const stanza = new Stanza(root, __metadata__);
      const params = Object.fromEntries(Array.from(this.attributes).map(({name, value}) => [name, value]));

      init(stanza, params);
    }
  }

  customElements.define(`togostanza-${__metadata__["@id"]}`, StanzaElement);
};

let initialized = false;

function ensureOuterInserted() {
  if (typeof __outer__ === 'undefined') { return; }
  if (initialized) { return; }

  initialized = true;

  const outer = document.createElement('div');

  outer.innerHTML = __outer__;

  document.body.append(outer);

  outer.querySelectorAll('script').forEach((orig) => {
    const el = document.createElement('script');

    el.textContent = orig.textContent;

    Array.from(orig.attributes).forEach((attr) => {
      el.setAttribute(attr.nodeName, attr.textContent);
    });

    orig.replaceWith(el);
  });
}

// TODO check attribute updates
