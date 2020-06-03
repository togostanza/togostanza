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

// TODO check if attributes work

module.exports = function (fn) {
  class StanzaElement extends HTMLElement {
    constructor() {
      super();
      let shadowRoot = this.attachShadow({ mode: "open" });
      const main = document.createElement("main");
      shadowRoot.appendChild(main);

      const s = new Stanza(__metadata__, main);
      fn(s, this.attributes);
    }
  }

  customElements.define("togostanza-" + __metadata__["@id"], StanzaElement);
};
