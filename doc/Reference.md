# Reference

# `togostanza` command

```
togostanza serve|s [options]  serve the repository locally
togostanza build|b [options]  build stanzas for deployment
togostanza generate|g         generate codes from templates
togostanza init [options]     create a new stanza repository
togostanza upgrade            upgrade stanza repository
togostanza help [command]     display help for command
```

## togostanza serve (togostanza s)

Starts server for stanza development.

- `-p, -port <port>` Port to listen on (default: `8080`)

## togostanza build (togostanza b)

Build stanzas for deployment.

- `-o, --output-path <dir>` Output directory (default: `./dist`)

## togostanza generate stanza (togostanza g stanza)

Generate a new stanza.

This command prompts you to enter the parameters interactively, but you can supply them with the following flags:

- `--label <label>`
- `--definition <definition>`
- `--type <type>`
- `--context <context>`
- `--display <display>`
- `--provider <provider>`
- `--license <license>`
- `--author <author>`
- `--address <address>`
- `--timestamp <date>`

## togostanza init

Create a new stanza repository.

This command prompts you to enter the parameters interactively, but you can supply them with the following flags:

- `--git-url <url>`
- `--name <name>`
- `--license <license>`
- `--package-manager <npm|yarn>`

In addition, the following flags are available:

- `--skip-install` Skip the initial package installation. This is primarily for testing purposes.
- `--skip-git` Skip Git configuration.

## togostanza upgrade

Upgrade the stanza repository to use the newer version of togostanza.

## togostanza help

Display help for command.

# Stanza Structure

(TODO: show directory structure here)

## Stanza Function

The stanza function is defined in the stanza script (`stanzas/<stanza-id>/index.js`) and is called when a stanza is to be rendered.

It takes the following two arguments:

- `stanza` The stanza object. To be described below.
- `params` An object containing the parameters passed from the page in which the stanza was embedded.

For example, a typical stanza function might look like this:

```js
export default function hello(stanza, params) {
  stanza.render({
    template: 'stanza.html.hbs',
    parameters: {
      greeting: `Hello, ${params['say-to']}!`
    }
  });
}
```

Example of the use of this stanza:

```html
<togostanza-hello say-to="world"></togostanza-hello>
```

When a stanza is embedded like this, the attributes of the element are passed as parameters to the stanza function.

- metadata.json
    - parameters, styles
    - togostanza-about-link-placement
- styling
- npm package
- assets
- deploy
- lib

# Stanza Object

The stanza object is an object which wraps the DOM element of the stanza and provides several properties and methods.

## stanza.render(options)

Renders contents from the given template. `options` is an object that has the following properties:

- `template` Template name. Specify by the filename in `templates` directory.
- `parameters` Parameters to pass to the template.
- `selector` Destination selector. Specify this if you want to update the stanza partially. Default is `main`, which is the main element of the stanza.

The template is written in [Handlebars](https://handlebarsjs.com/).

### Example: Render a simple template

```js
// stanzas/hello/index.js

stanza.render({
  template: 'stanza.html.hbs',
  parameters: {
    users: ['Alice', 'Bob']
  }
});
```

```hbs
{{! stanzas/hello/templates/stanza.html.hbs }}

<h1>Users</h1>

<ul>
  {{#each users as |user|}}
    <li>{{user}}</li>
  {{/each}}
</ul>
```

## stanza.query(options)

Issues SPARQL query. `options` is an object that has the following properties:

- `endpoint` The URL of the SPARQL endpoint.
- `template` Template name for the query. Specify by the filename in `templates` directory.
- `parameters` Parameters to pass to the query template.
- `method` HTTP method to be used to issue the query. Specify `"GET"` or `"POST"` (Optional. Default is `"GET"`)

The template is written in [Handlebars](https://handlebarsjs.com/).

This method returns a promise. Use `await` to wait until the query completed. You can handle errors with the `try...catch` statement.

### Example: Get the adjacent prefectures from DBpedia endpoint

```js
// stanzas/hello/index.js

try {
  const results = await stanza.query({
    endpoint: 'http://ja.dbpedia.org/sparql',
    template: 'adjacent-prefectures.rq.hbs',
    parameters: {
      of: '東京都'
    }
  });

  console.log(results);
} catch (e) {
  console.error(e);
}
```

```hbs
{{! stanzas/hello/templates/adjacent-prefectures.rq.hbs }}

PREFIX prop-ja: <http://ja.dbpedia.org/property/>
PREFIX resource-ja: <http://ja.dbpedia.org/resource/>
SELECT DISTINCT *
WHERE {
    resource-ja:{{of}} prop-ja:隣接都道府県 ?o .
}
```

## stanza.root

Shadow root of the stanza. See [Using shadow DOM - Web Components | MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) for details.

### Example: Get all anchors contained in the stanza's shadow root

```js
console.log(stanza.root.querySelectorAll('a'));
```

### Example: Update stanza output manually without using stanza.render()

```js
stanza.root.querySelector('main').textContent = 'Look at me!';
```

### Example: Get a value of stanza's CSS custom property

```js
console.log(getComputedStyle(stanza.root.host).getPropertyValue('--text-color'));
```

# Utility Functions

## grouping(objs, ...keys)

Groups an array of objects by specified keys.

### Example: Group objects values of `x` then `y`

```js
import { grouping } from 'togostanza/utils';

const objs = [
  {x: 1, y: 3},
  {x: 1, y: 4},
  {x: 2, y: 5},
  {x: 2, y: 6}
];

console.log(grouping(objs, 'x', 'y'));
//=> [
//     {x: 1, y: [3, 4]},
//     {x: 2, y: [5, 6]}
//   ]
```

### Example: Use a composite key

```js
import { grouping } from 'togostanza/utils';

const objs = [
  {x: 1, y: 1, z: 3},
  {x: 1, y: 2, z: 4},
  {x: 2, y: 1, z: 5},
  {x: 2, y: 2, z: 6},
  {x: 1, y: 2, z: 7},
  {x: 2, y: 1, z: 8}
];

console.log(grouping(objs, ['x', 'y'], 'z'));
//=> [
//     {x_y: [1, 1], z: [3]},
//     {x_y: [1, 2], z: [4, 7]},
//     {x_y: [2, 1], z: [5, 8]},
//     {x_y: [2, 2], z: [6]}]
//   ]
```

### Example: Give an alias

```js
import { grouping } from 'togostanza/utils';

const objs = [
  {x: 1, y: 3},
  {x: 1, y: 4},
  {x: 2, y: 5},
  {x: 2, y: 6}
];

console.log(grouping(objs, {key: 'x', alias: 'z'}, 'y'));
//=> [
//     {z: 1, y: [3, 4]},
//     {z: 2, y: [5, 6]}
//   ]
```

## unwrapValueFromBinding(result)

Unwraps an [SPARQL JSON Results Object](https://www.w3.org/TR/sparql11-results-json/#json-result-object), returns simple Array of key-value objects.

### Example

```js
import { unwrapValueFromBinding } from 'togostanza/utils';

const result = {
  "head": {"vars": ["s", "p", "o"]
  },
  "results": {
    "bindings": [{
      "s": {
        "type": "uri",
        "value": "http://example.com/s"
      },
      "p": {
        "type": "uri",
        "value": "http://example.com/p"
      },
      "o": {
        "type": "uri",
        "value": "http://example.com/o"
      }
    }]
  }
};

console.log(unwrapValueFromBinding(result));
//=> [
//     {
//       "s": "http://example.com/s",
//       "p": "http://example.com/p",
//       "o": "http://example.com/o"
//     }
//   ]
```

# Deprecated APIs

## stanza.select(selector)

Deprecated. Use `stanza.root.querySelector(selector)` instead.

## stanza.selectAll(selector)

Deprecated. Use `stanza.root.querySelectorAll(selector)` instead.
