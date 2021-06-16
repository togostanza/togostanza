# Tips

## How can I use external libraries?

Let's import `d3-scale` package and use the `scaleLinear` function, for example.

Do `npm install` (or use `yarn add` if you choose it)

```sh
$ npm install d3-scale
```

Then use `import` in `stanzas/hello/index.js`:

```js
import Stanza from 'togostanza/stanza';

import { scaleLinear } from 'd3-scale';

export default class Hello extends Stanza {
  async render() {
    const scale = scaleLinear().domain([0, 1.0]).range([0, 100]);
    console.log(scale(0.42));
  }
}
```

## Self-hosting stanzas

You can serve your stanza repository with your own web server:

1. Run `npx togostanza build` to build stanzas for production.
2. Serve contents under `dist` directory.

Note that web servers that are going to serve stanzas need to add `Access-Control-Allow-Origin` header. This is because the stanzas are loaded by `<script type="module" ...>` and the request will be cross-origin requests. Usually, specifying `Access-Control-Allow-Origin: *` will work. If you need more fine grained controls, see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers for details.

GitHub pages are configured that way, so you won't have any problems. If you want to host stanzas yourself, you need to do it yourself.

## Customizing the Rollup plugins (EXPERIMENTAL)

togostanza uses Rollup internally to build stanzas. You can add plugins to Rollup by placing a file named `togostanza-build.mjs` in the root of the repository. The `environment` argument can be either `"development"` or `"production"` (indicating whether to serve or build).

``` js
// togostanza-build.mjs

import vue from 'rollup-plugin-vue';

export default function config(environment) {
  return {
    rollup: {
      plugins: [
        vue()
      ]
    }
  };
}
```

Note that this feature is highly experimental and may change in future versions.