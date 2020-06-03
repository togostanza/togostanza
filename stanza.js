class Stanza {
  constructor(metadata, main) {
    this.main = main;
    this.metadata = metadata;
  }

  async render(params) {
    const htmlTemplate = await import(
      "provider/" + this.metadata["@id"] + "/templates/" + params.template
    );
    const html = htmlTemplate.default(params.parameters);
    this.main.innerHTML = html;
  }
}

module.exports = function (fn) {
  class StanzaElement extends HTMLElement {
    constructor() {
      super();
      let shadowRoot = this.attachShadow({ mode: "open" });
      const main = document.createElement("main");
      shadowRoot.appendChild(main);

      const s = new Stanza(__metadata__, main);

      const params = {};
      for (const { name, value } of this.attributes) {
        params[name] = value;
      }

      fn(s, params);
    }
  }

  customElements.define("togostanza-" + __metadata__["@id"], StanzaElement);
};

// TODO check attribute updates
