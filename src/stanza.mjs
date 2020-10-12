import HandlebarsRuntime from 'handlebars/runtime.js';

import { grouping, unwrapValueFromBinding } from '../utils.mjs';

export default class Stanza {
  constructor(host, metadata, templates, url) {
    this.root     = host.shadowRoot;
    this.metadata = metadata;
    this.url      = url;

    const handlebarsRuntime = HandlebarsRuntime.create();

    this.templates = Object.fromEntries(templates.map(([name, spec]) => {
      return [name, handlebarsRuntime.template(spec)];
    }));

    const bbox = document.createElement('div');
    bbox.style.position = 'relative';

    const main = document.createElement('main');
    bbox.appendChild(main);

    this.aboutLink = document.createElement('togostanza-about-link');
    this.aboutLink.setAttribute('href', url.replace(/\.js$/, '.html'));
    this.setAboutLinkPlacement(host.getAttribute('togostanza-about-link-placement'));

    bbox.appendChild(this.aboutLink);

    this.root.appendChild(bbox);

    // TODO migrate
    this.grouping               = grouping;
    this.unwrapValueFromBinding = unwrapValueFromBinding;
  }

  setAboutLinkPlacement(placement) {
    if (placement) {
      this.aboutLink.setAttribute('placement', placement);
    } else {
      this.aboutLink.removeAttribute('placement');
    }
  }

  select(selector) {
    return this.root.querySelector(selector);
  }

  selectAll(selector) {
    return this.root.querySelectorAll(selector);
  }

  render({template, parameters, selector}) {
    const html = this.templates[template](parameters);

    this.select(selector || 'main').innerHTML = html;
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

  importWebFontCSS(url) {
    const el = document.createElement('link');

    el.rel  = 'stylesheet';
    el.type = 'text/css';
    el.href = url;

    document.head.appendChild(el);
    this.root.appendChild(el.cloneNode());
  }
}
