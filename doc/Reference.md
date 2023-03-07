# Reference

## `togostanza` command

```
togostanza serve|s [options]  serve the repository locally
togostanza build|b [options]  build stanzas for deployment
togostanza generate|g         generate codes from templates
togostanza init [options]     create a new stanza repository
togostanza upgrade            upgrade stanza repository
togostanza help [command]     display help for command
```

### togostanza serve (togostanza s)

Starts server for stanza development.

- `-p, -port <port>` Port to listen on (default: `8080`)

### togostanza build (togostanza b)

Build stanzas for deployment.

- `-o, --output-path <dir>` Output directory (default: `./dist`)

### togostanza generate stanza (togostanza g stanza)

Generate a new stanza.

This command prompts you to enter the parameters interactively, but you can supply them with the following flags:

- `--label <label>`
- `--definition <definition>`
- `--license <license>`
- `--author <author>`
- `--timestamp <date>`

### togostanza init

Create a new stanza repository.

This command prompts you to enter the parameters interactively, but you can supply them with the following flags:

- `--git-url <url>`
- `--name <name>`
- `--license <license>`
- `--package-manager <npm|yarn>`

In addition, the following flags are available:

- `--skip-install` Skip the initial package installation. This is primarily for testing purposes.
- `--skip-git` Skip Git configuration.

### togostanza upgrade

Upgrade the stanza repository to use the newer version of togostanza.

### togostanza help

Display help for command.

## Structure of Stanza

The `togostanza init` command generates the files and directory structure for a new stanza repository.

| File/directory      | Purpose                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `README.md`         | Description of the repository. This is for informational purposes only (mainly for view on GitHub). |
| `package.json`      | Basic metadata and dependency packages for the repository, managed by the `npm` command.            |
| `package-lock.json` | The versions of the dependencies that the `npm` command resolved. Do not edit it manually.          |
| `common.scss`       | Repository-wide style definitions. It is imported from each stanza's `style.scss`.                  |
| `stanzas/`          | The directory where the stanzas are located. See below.                                             |
| `assets/`           | Static assets, such as images.                                                                      |
| `lib/`              | Common JavaScript files imported from each stanza.                                                  |
| `node_modules/`     | The installation location of the dependent packages. Do not edit it manually.                       |

Also, the togostanza generate stanza command generates files and directory structure for new stanza in the `stanzas` directory.

| File/directory               | Purpose                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `stanzas/{id}/README.md`     | Description of the stanza. It appears in the Overview tab of the stanza page.            |
| `stanzas/{id}/index.js`      | Entry point for the stanza. Implement the logic in this file.                            |
| `stanzas/{id}/metadata.json` | Definitions of basic stanza metadata and parameters, styles, etc.                        |
| `stanzas/{id}/style.scss`    | Stanza-specific style definitions that are automatically loaded and applied.             |
| `stanzas/{id}/assets/`       | Stanza-specific static assets, such as images.                                           |
| `stanzas/{id}/templates/`    | Templates used by the stanza. HTML templates for rendering, SPARQL query templates, etc. |

### Stanza metadata

`metadata.json` is a file that represents stanza metadata in [JSON-LD](https://json-ld.org/) format. Define general information such as stanza identifiers, display names, and author information, as well as parameters and style variables to customize the behavior and appearance of the stanza.

| Key                     | Purpose                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `@id`                   | Identifier of the stanza. Used as the name of the stanza element (`<togostanza-{{id}}>`) and the name of the generated JavaScript file, etc. |
| `stanza:label`          | Human-readable stanza name. Used for the list of stanzas and help pages in the repository.                                                   |
| `stanza:definition`     | Brief description of the stanza. Used for the list of stanzas and stanza pages in the repository.                                            |
| `stanza:license`        | License for this stanza.                                                                                                                     |
| `stanza:author`         | Name of the stanza author.                                                                                                                   |
| `stanza:contributor`    | List of names who have contributed to this stanza.                                                                                           |
| `stanza:created`        | Date the stanza was created.                                                                                                                 |
| `stanza:updated`        | Date the stanza was updated.                                                                                                                 |
| `stanza:parameter`      | Parameter definitions that the stanza receives from the outside. See below.                                                                  |
| `stanza:menu-placement` | Display position of the icon link that opens the stanza menu page.                                                                           |
| `stanza:style`          | Definition of CSS variables to customize the appearance of the stanza. See below.                                                            |

#### Parameters

The parameters are a property of the `stanza:parameter` key in `metadata.json`, which is an array of objects. Each object has the following properties:

| Key                  | Purpose                                                                                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stanza:key`         | Key name of the parameter.                                                                                                                                                                |
| `stanza:type`        | The data type of this parameter. It is used for type conversion of the parameter value and the type attribute of the input field on the stanza page. Possible values are described below. |
| `stanza:choice`      | List of choices used when `stanza:type` is `single-choice`. The value is an array of strings.                                                                                             |
| `stanza:example`     | The value to be set as the initial value in the input field of the stanza page, given as the type corresponding to `stanza:type` (for example, `true` instead of `"true"` for Boolean).   |
| `stanza:description` | Brief description of this parameter. It will appear below the input field.                                                                                                                |
| `stanza:required`    | Whether this parameter is mandatory or not. If true, the field name will be prefixed with a red sign.                                                                                     |
| `stanza:include`     | Path to “common parameter definition” file to include. If specified, all of the above settings are ignored. See “Common Parameter Definition“ section for more information.               |
| `stanza:label`       | For `boolean` parameters, a label to write what the value means when it is True. For other types, it is ignored. |

##### Possible values for `stanza:type`

| `stanza:type`     | Data type of parameter | Type attribute of input field                        |
| ----------------- | ---------------------- | ---------------------------------------------------- |
| `string`          | String                 | text                                                 |
| `number`          | Number                 | number                                               |
| `boolean`         | Boolean                | checkbox                                             |
| `date`            | Date                   | date                                                 |
| `datetime`        | Date                   | datetime-local                                       |
| `json`            | Object                 | text                                                 |
| `single-choice`   | String                 | (`<select>` is used instead of `<input>`)            |
| (everything else) | String                 | (The value of `stanza:type` will be passed directly) |

#### Style variables

Stanzas can declare their own parameterized style variables, allowing stanza users to customize their appearance when they are embedded. The `stanza:style` property is also an array and each element has the following properties:

| Key                  | Purpose                                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `stanza:key`         | Name of the CSS variable.                                                                                                   |
| `stanza:type`        | Type of input field for setting this variable on the stanza page. Possible values are identical to those of the parameters. |
| `stanza:choice`      | List of choices used when `stanza:type` is `single-choice`. The value is an array of strings.                               |
| `stanza:default`     | Default value, given as the type corresponding to `stanza:type` (for example, `true` instead of `"true"` for Boolean).      |
| `stanza:description` | Brief description of this variable. It will appear below the input field.                                                   |

#### Common Parameter Definition

The Common Parameter Definition function can be used to define a set of parameters that are commonly used among multiple stanzas at once.

Create a JSON file of common parameter definitions in the form of an extracted array to be set in `stanza:parameter` in `metastanza.json`.

Example:

```json
[
  {
    "stanza:key": "data-url",
    "stanza:type": "text",
    "stanza:example": "https://example.com/chart.json",
    "stanza:description": "Data source URL",
    "stanza:required": true
  },
  {
    "stanza:key": "data-type",
    "stanza:type": "single-choice",
    "stanza:choice": [
      "json",
      "tsv",
      "csv",
      "sparql-results-json",
      "elasticsearch"
    ],
    "stanza:example": "json",
    "stanza:description": "Data type",
    "stanza:required": true
  }
]
```

The common parameter definition can be loaded from other packages. If you have placed this file in `params/data-chart.json` of the `togostanza-utils` package, you can include it by adding `stanza:include` to `stanza:parameter`:

```json
"stanza:parameter": [
  {
    "stanza:include": "togostanza-utils/params/data-chart.json"
  }
// ...
```

### Stanza class

The stanza class is defined in the stanza script (`stanzas/<stanza-id>/index.js`), extending the `Stanza` base class, which is provided by `togostanza` package.

There are several methods in the Stanza class the are expected to be overridden. One of them is the `render()` method, which is called when a stanza is to be rendered.

For example, a typical stanza class might look like this:

```js
import Stanza from 'togostanza/stanza';

export default class Hello extends Stanza {
  async render() {
    this.renderTemplate({
      template: 'stanza.html.hbs',
      parameters: {
        greeting: `Hello, ${this.params['say-to']}!`,
      },
    });
  }
}
```

Example of the use of this stanza:

```html
<togostanza-hello say-to="world"></togostanza-hello>
```

When a stanza is embedded like this, the attributes of the element are accessible via `this.params`.

#### Customizing the behavior when changing attributes

By default, whenever the attributes of a stanza element are changed, the `render()` method is executed and the element is drawn from scratch.

If this behavior is undesirable, for example because the `render()` method contains heavy processing, it can be controlled manually by defining the `handleAttributeChange` method. The default behavior of `handleAttributeChange()` defined in the `Stanza` base class is to call the `render()` method with debounce to reduce unnecessary rendering.

```js
import Stanza from 'togostanza/stanza';

export default class Hello extends Stanza {
  async render() {
    // The render method will only be executed once
  }

  async handleAttributeChange(name, oldValue, newValue) {
    // Write the code to update the element when the attribute is changed here
  }
}
```

### Templating

The files in `stanzas/{id}/templates/` will be interpreted as Handlebars templates. This makes it easy to generate different outputs depending on the parameters.

For example, here is a invocation of `this.renderTemplate()` method and the corresponding template:

```js
this.renderTemplate({
  template: 'stanza.html.hbs',
  parameters: {
    greeting: `Hello, ${this.params['say-to']}!`,
  },
});
```

```hbs
{{! stanzas/hello/templates/stanza.html.hbs }}

Hello, {{greeting}}!
```

`{{...}}` is an expression of Handlebars, here outputting the value of the `greeting` parameter. `this.renderTemplate()` method treats the object passed to the `parameters` option as the context of the template. Note that `{{! ... }}` is a comment.

If your template file has a `.html.hbs` or `.html` extension, the output of the `{{...}}` will be automatically HTML escaped. You can disable escaping with three curly brackets (`{{{...}}}`).

Nested objects can be accessed using the dot-notation just like normal JavaScript.

```js
this.renderTemplate({
  template: 'stanza.html.hbs',
  parameters: {
    user: {
      name: 'ursm',
    },
  },
});
```

```hbs
{{! stanzas/hello/templates/stanza.html.hbs }}

Hello, {{user.name}}!
```

You can also use helpers such as `#if` and `#each` to perform conditional branches and loops.

```js
this.renderTemplate({
  template: 'stanza.html.hbs',
  parameters: {
    fields: [
      {
        label: 'First name',
        required: true
      },
      {
        label: 'Middle name',
        required: false
      },
      {
        label: 'Last name',
        required: true
      }
    }
  }
});
```

```hbs
{{! stanzas/hello/templates/stanza.html.hbs }}

{{#each fields as |field|}}
  <div>
    <label>
      {{field.label}}

      {{#if field.required}}
        <span class="required">(required)</span>
      {{/if}}
    </label>

    <input type="text" />
  </div>
{{/each}}
```

See [Handlebars Language Guide](https://handlebarsjs.com/guide/) for comprehensive information about Handlebars templates.

### Styling

Style definitions in `stanzas/{id}/style.scss` are applied automatically when rendering the stanza.

This file is written in [SCSS](https://sass-lang.com/), a kind of meta language for generating CSS. SCSS extends the normal CSS syntax in several ways. For example, the directive `@use` has the ability to import another file. Stanzas generated by togostanza command are initially configured to import `common.scss` from `stanzas/{id}/style.scss`, so stanza specific styles and common styles between stanzas can be defined separately.

Stanza CSS is evaluated in the Shadow DOM context, so its behavior may differ in some ways from that of a typical web page. For example, stanzas don't have a body element, so styling for the body element is simply ignored (you can use the `:host` pseudo-class instead for this purpose). For more information about the Shadow DOM, see [Shadow DOM v1: Self-Contained Web Components  |  Web Fundamentals](https://developers.google.com/web/fundamentals/web-components/shadowdom).

Each `stanza:style` item you define in metadata.json can be used in the stanza's stylesheet as a CSS variable.

```json
{
  "stanza:key": "--greeting-color",
  "stanza:type": "color",
  "stanza:default": "#eb7900",
  "stanza:description": "text color of greeting"
}
```

```css
p.greeting {
  color: var(--greeting-color);
}
```

### Static assets

Assets are static files, like images, and are stored in directories `assets/` or `stanzas/{id}/assets`.

#### Use from JS

You can use the `import` statement to load assets as base64-encoded data URLs. Supported file types are `.svg`, `.png`, `.jpg`, `.jpeg`, `.gif` and `.webp`.

```js
// stanzas/foo-stanza/index.js

import Stanza from 'togostanza/stanza';

import img1 from '@/assets/img1.png';
import img2 from '@/stanzas/foo-stanza/assets/img2.png';

export default class FooStanza extends Stanza {
  async render() {
    this.renderTemplate({
      template: 'stanza.html.hbs',
      parameters: {
        img1,
        img2,
      },
    });
  }
}
```

```hbs
{{! stanzas/foo-stanza/templates/stanza.html.hbs }}

<img src={{img1}}>
<img src={{img2}}>
```

#### Use from CSS

Prepend `./assets/` or `./{stanza-id}/assets/` to the file name of the asset.

```css
background-image: url(./assets/img1.png);
background-image: url(./foo-stanza/assets/img2.png);
```

### Shared libraries

Code shared from multiple stanzas can be placed in the `lib/` directory.

#### Using named exports

```js
// lib/calc.js

export function add(x, y) {
  return x + y;
}

export function subtract(x, y) {
  return x - y;
}
```

```js
// stanzas/hello/index.js

import { add, subtract } from '@/lib/calc.js';
```

#### Using default exports

```js
// lib/multiply.js

export default function (x, y) {
  return x * y;
}
```

```js
// stanzas/hello/index.js

import multiply from '@/lib/multiply.js';
```


## Custom menu

By defining (overriding) the `menu()` method in the stanza class, you can add a menu item:

```javascript
// stanzas/custom-menu/index.js

import Stanza from 'togostanza/stanza';

export default class CustomMenuStanza extends Stanza {
  menu() {
    return [
      {
        type: 'item',
        label: 'Open alert',
        handler: () => {
          alert(`Hi, ${this.params['say-to']}!`);
        },
      },
    ];
  }
  // ...
}
```

`menu()` must return an array of menu items.

A menu item is an object like this:

```javascript
{
  type: 'item',
  label: 'Arbitrary menu label',
  handler: () => { /* code invoked on click */ }
}
```

You can also add a divider by adding an object with `'divider'` type:

```javascript
{
  type: 'divider'
}
```


## Utility methods of Stanza

You can use the utility methods provided by the stanza base class.

### this.renderTemplate(options)

Renders contents from the given template. `options` is an object that has the following properties:

- `template` Template name. Specify by the filename in `templates` directory.
- `parameters` Parameters to pass to the template.
- `selector` Destination selector. Specify this if you want to update the stanza partially. Default is `main`, which is the main element of the stanza.

The template is written in [Handlebars](https://handlebarsjs.com/).

#### Example: Render a simple template

```js
// stanzas/hello/index.js

this.renderTemplate({
  template: 'stanza.html.hbs',
  parameters: {
    users: ['Alice', 'Bob'],
  },
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

### this.params

Returns the parameters passed to the stanza as an object.

### this.query(options)

Issues SPARQL query. `options` is an object that has the following properties:

- `endpoint` The URL of the SPARQL endpoint.
- `template` Template name for the query. Specify by the filename in `templates` directory.
- `parameters` Parameters to pass to the query template.
- `method` HTTP method to be used to issue the query. Specify `"GET"` or `"POST"` (Optional. Default is `"GET"`)

The template is written in [Handlebars](https://handlebarsjs.com/).

This method returns a promise. Use `await` to wait until the query completed. You can handle errors with the `try...catch` statement.

#### Example: Get the adjacent prefectures from DBpedia endpoint

```js
// stanzas/hello/index.js

import Stanza from 'togostanza/stanza';

export default class Hello extends Stanza {
  async render() {
    try {
      const results = await this.query({
        endpoint: 'http://ja.dbpedia.org/sparql',
        template: 'adjacent-prefectures.rq.hbs',
        parameters: {
          of: '東京都',
        },
      });

      console.log(results);
    } catch (e) {
      console.error(e);
    }
  }
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

### this.importWebFontCSS(url)

Stylesheets defining web fonts are ignored in the Shadow DOM. To work around this, we provide a helper method to insert the CSS of the specified URL outside of the Shadow DOM.

```js
import Stanza from 'togostanza/stanza';

export default class extends Stanza {
  constructor() {
    super(...arguments);

    this.importWebFontCSS(
      'https://use.fontawesome.com/releases/v5.6.3/css/all.css'
    );
  }

  async render() {
    // ...
  }
}
```

### this.root

Shadow root of the stanza. See [Using shadow DOM - Web Components | MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) for details.

#### Example: Get all anchors contained in the stanza's shadow root

```js
console.log(this.root.querySelectorAll('a'));
```

#### Example: Update stanza output manually without using stanza.render()

```js
this.root.querySelector('main').textContent = 'Look at me!';
```

#### Example: Get a value of stanza's CSS custom property

```js
console.log(getComputedStyle(this.element).getPropertyValue('--text-color'));
```

### this.element

Returns the stanza element. An instance of a subclass of [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement), i.e. `<togostanza-{{id}}></togostanza-{{id}}>` is returned.


## Utility functions

### grouping(objs, ...keys)

Groups an array of objects by specified keys.

#### Example: Group objects values of `x` then `y`

```js
import { grouping } from 'togostanza/utils';

const objs = [
  { x: 1, y: 3 },
  { x: 1, y: 4 },
  { x: 2, y: 5 },
  { x: 2, y: 6 },
];

console.log(grouping(objs, 'x', 'y'));
//=> [
//     {x: 1, y: [3, 4]},
//     {x: 2, y: [5, 6]}
//   ]
```

#### Example: Use a composite key

```js
import { grouping } from 'togostanza/utils';

const objs = [
  { x: 1, y: 1, z: 3 },
  { x: 1, y: 2, z: 4 },
  { x: 2, y: 1, z: 5 },
  { x: 2, y: 2, z: 6 },
  { x: 1, y: 2, z: 7 },
  { x: 2, y: 1, z: 8 },
];

console.log(grouping(objs, ['x', 'y'], 'z'));
//=> [
//     {x_y: [1, 1], z: [3]},
//     {x_y: [1, 2], z: [4, 7]},
//     {x_y: [2, 1], z: [5, 8]},
//     {x_y: [2, 2], z: [6]}]
//   ]
```

#### Example: Give an alias

```js
import { grouping } from 'togostanza/utils';

const objs = [
  { x: 1, y: 3 },
  { x: 1, y: 4 },
  { x: 2, y: 5 },
  { x: 2, y: 6 },
];

console.log(grouping(objs, { key: 'x', alias: 'z' }, 'y'));
//=> [
//     {z: 1, y: [3, 4]},
//     {z: 2, y: [5, 6]}
//   ]
```

### unwrapValueFromBinding(result)

Unwraps an [SPARQL JSON Results Object](https://www.w3.org/TR/sparql11-results-json/#json-result-object), returns simple Array of key-value objects.

#### Example

```js
import { unwrapValueFromBinding } from 'togostanza/utils';

const result = {
  head: {
    vars: ['s', 'p', 'o'],
  },
  results: {
    bindings: [
      {
        s: {
          type: 'uri',
          value: 'http://example.com/s',
        },
        p: {
          type: 'uri',
          value: 'http://example.com/p',
        },
        o: {
          type: 'uri',
          value: 'http://example.com/o',
        },
      },
    ],
  },
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
