class Stanza {
  constructor(main, metadata) {
    this.main     = main;
    this.metadata = metadata;
  }

  async render(params) {
    const template = await import(`provider/${this.metadata["@id"]}/templates/${params.template}`);
    const html     = template.default(params.parameters);

    this.main.innerHTML = html;
  }
}

module.exports = function(init) {
  class StanzaElement extends HTMLElement {
    constructor() {
      super();

      const root = this.attachShadow({mode: "open"});
      const main = document.createElement("main");

      root.appendChild(main);

      const stanza = new Stanza(main, __metadata__);
      const params = Object.fromEntries(Array.from(this.attributes).map(({name, value}) => [name, value]));

      init(stanza, params);
    }
  }

  customElements.define(`togostanza-${__metadata__["@id"]}`, StanzaElement);
};

// TODO check attribute updates
