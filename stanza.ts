import debounce from 'lodash.debounce';
import HandlebarsRuntime from 'handlebars/runtime';
import type { TemplateDelegate } from 'handlebars';

type Metadata = Record<string, any>;

type MenuItem = {
  type: 'item';
  label: string;
  handler: () => void;
};

type MenuDivider = {
  type: 'divider';
};

type MenuDefinitionItem = MenuItem | MenuDivider;
export type MenuDefinition = Array<MenuDefinitionItem>;
type MenuDefinitionFn = () => MenuDefinition;
type MenuElement = HTMLElement & { menuDefinition: MenuDefinitionFn };

export default class Stanza {
  element: HTMLElement;
  metadata: Metadata;
  renderDebounced: () => void;
  url: string;
  menuElement: MenuElement;
  templates: Record<string, TemplateDelegate>;

  constructor(
    element: HTMLElement,
    metadata: Metadata,
    templates: Array<[string, TemplateSpecification]>,
    url: string
  ) {
    this.element = element;
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

    this.menuElement = document.createElement(
      'togostanza--menu'
    ) as MenuElement;
    this.menuElement.setAttribute('href', url.replace(/\.js$/, '.html'));
    this.menuElement.menuDefinition = this.menu.bind(this);

    bbox.appendChild(this.menuElement);

    element.shadowRoot?.appendChild(bbox);

    this.url = url;

    this.renderDebounced = debounce(() => {
      this.render();
    }, 50);
  }

  get root(): ShadowRoot {
    return this.element.shadowRoot!;
  }

  async render(): Promise<void> {}

  menu(): MenuDefinition {
    return [];
  }

  renderTemplate({
    template: templateName,
    parameters,
    selector,
  }: {
    template: string;
    parameters: Record<string, any>;
    selector?: string;
  }): void {
    const template = this.templates[templateName];

    if (!template) {
      throw new Error(
        `template "${templateName}" is missing, available templates: ${Object.keys(
          this.templates
        ).join(', ')}`
      );
    }

    const html = template(parameters);
    const main = this.root?.querySelector(selector || 'main');
    if (!main) {
      return;
    }
    main.innerHTML = html;
  }

  get params(): Record<string, any> {
    const attributes = this.element.attributes;

    return Object.fromEntries(
      this.metadata['stanza:parameter'].map((param: Record<string, any>) => {
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

  importWebFontCSS(cssUrl: string): void {
    const el = document.createElement('link');

    el.rel = 'stylesheet';
    el.type = 'text/css';
    el.href = new URL(cssUrl, this.url).href;

    document.head.appendChild(el);
    this.root?.appendChild(el.cloneNode());
  }

  handleAttributeChange(name: string, oldValue: string, newValue: string) {
    this.renderDebounced();
  }

  async query({
    template,
    parameters,
    endpoint,
    method,
  }: {
    template: string;
    parameters: Record<string, any>;
    endpoint: string;
    method?: string;
  }): Promise<any> {
    const sparql = this.templates[template](parameters);
    const payload = new URLSearchParams();

    payload.set('query', sparql);

    // NOTE specifying Content-Type explicitly because some browsers sends `application/x-www-form-urlencoded;charset=UTF-8` without this, and some endpoints may not support this form.
    return await fetch(endpoint, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/sparql-results+json',
      },
      body: payload,
    }).then((res) => res.json());
  }
}
