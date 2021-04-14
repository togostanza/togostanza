import debounce from 'lodash.debounce';
import HandlebarsRuntime from 'handlebars/runtime.js';

export default class Stanza {
  constructor(element, metadata, templates, url) {
    this.element  = element;
    this.metadata = metadata;

    const handlebarsRuntime = HandlebarsRuntime.create();
    this.templates = Object.fromEntries(
      templates.map(([name, spec]) => {
        return [name, handlebarsRuntime.template(spec)];
      })
    );

    const bbox = document.createElement('div');
    bbox.style.position = 'relative';

    const main = document.createElement('main');
    main.style.overflow = 'auto';
    bbox.appendChild(main);

    this.menu = document.createElement('togostanza--menu');
    this.menu.setAttribute('href', url.replace(/\.js$/, '.html'));
    // TODO set menu placement from 'togostanza-menu-placement' attr

    bbox.appendChild(this.menu);

    element.shadowRoot.appendChild(bbox);

    this.url = url;

    this.renderDebounced = debounce(() => {
      this.render();
    }, 50);
  }

  renderTemplate(templateName, { parameters, selector }) {
    const template = this.templates[templateName];

    if (!template) {
      throw new Error(
        `template "${templateName}" is missing, available templates: ${Object.keys(
          this.templates
        ).join(', ')}`
      );
    }

    const html = template(parameters);
    this.element.shadowRoot.querySelector(selector || 'main').innerHTML = html;
  }

  get params() {
    const attributes = this.element.attributes;

    return Object.fromEntries(
      this.metadata['stanza:parameter'].map((param) => {
        const key = param['stanza:key'];
        const type = param['stanza:type'];

        if (type === 'boolean') {
          return [key, attributes.hasOwnProperty(key)];
        }

        const valueStr = attributes[key]?.value;

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
            value = new Date(valueStr);
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

  importWebFontCSS(cssUrl) {
    const el = document.createElement('link');

    el.rel  = 'stylesheet';
    el.type = 'text/css';
    el.href = new URL(cssUrl, this.url).href;

    document.head.appendChild(el);
    this.element.shadowRoot.appendChild(el.cloneNode());
  }

  handleAttributeChange() {
    this.renderDebounced();
  }

  async query({template, parameters, endpoint, method}) {
    const sparql  = this.templates[template](parameters);
    const payload = new URLSearchParams();

    payload.set('query', sparql);

    // NOTE specifying Content-Type explicitly because some browsers sends `application/x-www-form-urlencoded;charset=UTF-8` without this, and some endpoints may not support this form.
    return await fetch(endpoint, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept':       'application/sparql-results+json'
      },
      body: payload
    }).then((res) => res.json());
  }
}
