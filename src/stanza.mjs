import HandlebarsRuntime from '~handlebars/runtime';

export default class Stanza {
  grouping               = grouping;
  groupBy                = groupBy;
  unwrapValueFromBinding = unwrapValueFromBinding;

  constructor(root, metadata, templates) {
    this.root     = root;
    this.metadata = metadata;

    this.templates = Object.fromEntries(templates.map(([name, spec]) => {
      return [name, HandlebarsRuntime.template(spec)];
    }));

    const main = document.createElement('main');

    this.root.appendChild(main);
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

function grouping(rows, ...keys) {
  const normalizedKeys = keys.map((key) => {
    if (key instanceof Array) {
      return {key, alias: key.join('_')};
    } else if (key instanceof Object) {
      return key;
    } else {
      return {key, alias: key};
    }
  });

  return (function _grouping(rows, keys) {
    const [currentKey, ...remainKeys] = keys;

    function fetch(row, key) {
      return key instanceof Array ? key.map((k) => row[k]) : row[currentKey.key];
    }

    if (keys.length === 1) {
      return rows.map((row) => fetch(row, currentKey.key));
    }

    return groupBy(rows, (row) => {
      return fetch(row, currentKey.key);
    }).map(([currentValue, remainValues]) => {
      const nextKey = remainKeys[0];

      return {
        [currentKey.alias]: currentValue,
        [nextKey.alias]:    _grouping(remainValues, remainKeys)
      };
    });
  })(rows, normalizedKeys);
}

function groupBy(array, func) {
  const ret = [];

  array.forEach((item) => {
    const key   = func(item);
    const entry = ret.find(e => e[0] === key);

    if (entry) {
      entry[1].push(item);
    } else {
      ret.push([key, [item]]);
    }
  });

  return ret;
}

function unwrapValueFromBinding(queryResult) {
  const bindings = queryResult.results.bindings;

  return bindings.map((binding) => {
    const ret = {};

    Object.keys(binding).forEach((key) => {
      ret[key] = binding[key].value;
    });

    return ret;
  });
}
