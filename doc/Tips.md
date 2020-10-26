# Tips

## How can I use external libraries?

Let's import `d3-scale` package and use the `scaleLinear` function, for example.

Do `npm install` (or use `yarn add` if you choose it)

```sh
$ npm install d3-scale
```

Then use `import` in `stanzas/hello/index.js`:

```js
import {scaleLinear} from "d3-scale";

export default async function hello(stanza, params) {
  const scale = scaleLinear().domain([0, 1.0]).range([0, 100]);
  console.log(scale(0.42));
}
```
