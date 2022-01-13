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

## Requesting a forced update of stanzas

You can request stanzas to re-render from the page where the stanzas are embedded as follows:

1. Find the stanza element

Query the stanza element to update like this:

```
const stanza = document.getElementsByTagName('togostanza-barchart')[0];
```

2. Request re-render

Call `render()` method of the stanza:

```
stanza.render()
```


## Using TypeScript

You can also use TypeScript to create Stanza. TypeScript support is not enabled by default. By placing `tsconfig.json` in the root of the stanza repository, TypeScript support is activated.

Depending on your project, `tsconfig.json` will be different, but for example, create a file like the following:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "moduleResolution": "node",
    "noResolve": false,
    "noEmit": false,
    "noEmitHelpers": false,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

When writing Stanza, TypeScript files should have a suffix of `.ts`. For example, instead of `index.js`, use `index.ts`.


## Building Stanzas with React

The easiest way to develop stanzas in React is to specify `"jsx": "react"` in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "jsx": "react",
    "moduleResolution": "node",
    "noResolve": false,
    "noEmit": false,
    "noEmitHelpers": false,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

Add the following packages to `dependencies` of `package.json`:

```json
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "lodash.camelcase": "^4.3.0",
```

To build React stanzas, use the following `index.tsx` as entry points, respectively. If you want to create a `hello-react` stanza, you can use the following:

```tsx
import React from "react";
import ReactDOM from "react-dom";
import camelCase from "lodash.camelcase";
import Stanza from "togostanza/stanza";
import App from "./App";

function toCamelCase(params: Record<string, unknown>) {
  const camelCaseParams: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    camelCaseParams[camelCase(key)] = value;
  });
  return camelCaseParams;
}

export default class HelloReact extends Stanza {
  async render() {
    const props = toCamelCase(this.params);
    ReactDOM.render(
      <App {...(props as any)} />,
      this.root.querySelector("main")
    );
  }

  handleAttributeChange() {
    const props = toCamelCase(this.params);
    ReactDOM.render(
      <App {...(props as any)} />,
      this.root.querySelector("main")
    );
  }
}
```

Write the contents of Stanza as React Component in `App.tsx`. The parameters passed to Stanza can be retrieved as props of the App component. An example is shown below:

```tsx
import React, { useState } from "react";

const App = ({ sayTo }: { sayTo: string }) => {
  const [count, setCount] = useState(0);
  const increment = () => setCount((prev) => prev + 1);

  const handleClick = () => {
    increment();
  };

  return (
    <div>
      <p>
        Hello <i>{sayTo}</i>
      </p>
      <p>{count} time(s) clicked</p>
      <button onClick={handleClick}>Click this</button>
    </div>
  );
};

export default App;
```

The final directory layout will look like this (only the essential files are shown):

```
├── stanzas
│   └── hello-react
│       ├── App.tsx
│       ├── index.tsx
│       └── metadata.json
└── tsconfig.json
```

## Building stanzas with Vue.js

Add the following packages to `dependencies` of `package.json`:

```json
    "vue": "^3.2.26",
    "@vue/compiler-sfc": "^3.2.26",
    "rollup-plugin-vue": "^6.0.0",
    "@rollup/plugin-replace": "^3.0.0",
```

Place `togostanza-build.mjs` with the following content in the root of the stanza repository:

```js
import vue from "rollup-plugin-vue";
import replace from "@rollup/plugin-replace";

export default function config(environment) {
  return {
    rollup: {
      plugins: [
        vue(),
        replace({
          values: {
            "process.env.NODE_ENV": JSON.stringify(environment),
            __VUE_OPTIONS_API__: "false",
            __VUE_PROD_DEVTOOLS__: "false",
          },
          preventAssignment: true,
        }),
      ],
    },
  };
}
```

For the stanza endpoint `index.js`, place a file like the following:

```js
import Stanza from "togostanza/stanza";
import { createApp, h } from "vue";
import App from "./App.vue";

export default class PaginationTable extends Stanza {
  async render() {
    const main = this.root.querySelector("main");
    const self = this;
    this._app = createApp({
      render() {
        return h(App, self.params);
      },
    });
    this._component = this._app.mount(main);
  }

  handleAttributeChange(name) {
    this._component?.$forceUpdate();
  }
}
```

Add `App.vue` as the main component:

```vue
<template>
  <div>
    <p>
      Hello <i>{{ sayTo }}</i>
    </p>
    <p>{{ count }} time(s) clicked</p>
    <button @click="handleClick">Click this</button>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  props: ["sayTo"],

  setup(props) {
    const count = ref(0);
    const handleClick = () => {
      count.value++;
    };

    return {
      count,
      handleClick,
    };
  },
});
</script>
```

The final directory layout will look like this (only the essential files are shown):

```
├── stanzas
│   └── hello-vue
│       ├── App.vue
│       ├── index.js
│       └── metadata.json
└── togostanza-build.mjs
```