import HandlebarsRuntime from '~handlebars/runtime';

export default class Stanza {
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
