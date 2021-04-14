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

    const main = document.createElement('main');
    main.style.overflow = 'auto';
    element.shadowRoot.appendChild(main);

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
}
