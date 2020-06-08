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

module.exports = function(init) {
  class StanzaElement extends HTMLElement {
    constructor() {
      super(...arguments);

      this.attachShadow({mode: "open"});

      const stanza = new Stanza(this.shadowRoot, __metadata__);
      const params = Object.fromEntries(Array.from(this.attributes).map(({name, value}) => [name, value]));

      init(stanza, params);
    }
  }

  customElements.define(`togostanza-${__metadata__["@id"]}`, StanzaElement);
};

// TODO check attribute updates
