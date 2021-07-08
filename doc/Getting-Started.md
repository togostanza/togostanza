# Getting Started

## Prerequisites

- Node.js 14.x

NOTE: You may see the warning `ExperimentalWarning: The ESM module loader is experimental.` with older versions of Node.js.

## Create a GitHub repository to host the stanza repository

Create a new repository on GitHub from [https://github.com/new](https://github.com/new).

Suppose we have created [http://github.com/togostanza/example-stanza-repo](http://github.com/togostanza/example-stanza-repo) as an illustration.

## Initialize a stanza repository

Run the following:

```
$ npx togostanza init
```

Then you will be asked a few questions. Enter the GitHub repository URL for the first question:

```
$ npx togostanza init
? Git repository URL (leave blank if you don't need to push to a remote Git repository): http://github.com/togostanza/example-stanza-repo
? stanza repository name (used as a directory name): example-stanza-repo
```

For subsequent questions, you can use the default values (just hit the Enter key). You may, of course, change the values depending on your preference.

If everything goes well, you will see the "Getting Started" message:

```
Getting Started
---------------

Create a new stanza:

  $ cd example-stanza-repo
  $ npx togostanza generate stanza

Serve the repository locally:

  $ cd example-stanza-repo
  $ npx togostanza serve

Build stanzas for deployment:

  $ cd example-stanza-repo
  $ npx togostanza build
```

## Push the repository to GitHub

Let's move into the repository directory:

```
$ cd example-stanza-repo
```

The command `togostanza init` created a stanza repository. It cloned the GitHub repository specified first and created a commit on it. The commit contains the brand new stanza repository.

We can `git push` to send it to GitHub:

```
$ git push
```

Open [https://github.com/togostanza/example-stanza-repo](https://github.com/togostanza/example-stanza-repo) and make sure that we've pushed it correctly.

On that page, you'll see the content of `README.md`, which is automatically generated. Write your own description of the stanza repository in `README.md`.

## Create the first stanza

Enter the following command in order to create a stanza:

```
$ npx togostanza generate stanza
```

You'll be asked a few questions. Let's say we are going to create the stanza whose name is "hello":

```
? stanza id (<togostanza-ID>): hello
? label: Hello
```

More questions follow. At this time, you can go with the default values by hitting the Enter key.
Change values as you need.

After all questions are answered, `togostanza` will generate the stanza as follows:

```
   create stanzas/hello/metadata.json
   create stanzas/hello/README.md
   create stanzas/hello/index.js
   create stanzas/hello/style.scss
   create stanzas/hello/templates/stanza.html.hbs
```

## Preview the stanza

Here we can preview the stanza. Enter

```
$ npx togostanza serve
```

to launch a development server. You will see the message as follows:

```
Serving at http://localhost:8080
```

Open the URL on your browser and choose "Hello" stanza.

The overview of hello stanza will appear. You can change this by editing `metastanza.json` and `README.md`. It is recommended to write a document that gives a good overview about this stanza.

On the right pane, you will see the HTML snippet and the preview. You can use this snippet to embed the stanza on any page you want. The preview shows the stanza working.

In "Customize" tab, you can customize the behavior of the stanza. The preview and the snippet (on the right pane) will update corresponding to the values of the fields (on the left pane).

## Commit and push to GitHub

Okay, it seems to be working fine. Let's commit this new stanza to your local git repository and push to GitHub.

```bash
$ git add .
$ git commit -m "Add hello stanza"
$ git push
```

## Configure GitHub pages

The stanza repository can be published via [GitHub Pages](https://pages.github.com/) with a few operations. We use [GitHub Actions](https://docs.github.com/en/actions/getting-started-with-github-actions/about-github-actions) to build and publish.

Open "Actions" tab on the GitHub Repository. You will see the action "Initialize new stanza repository: example-stanza-repo" is "in progress" state (or maybe already finished). This is the workflow configured by `togostanza init`.

Click "Initialize new stanza repository: example-stanza-repo" link to see the job details. Wait until the job is successfully completed.

Due to technical restrictions, this first deployment will fail even if the action have completed successfully. In order to resolve this problem, go "Settings" tab on the repository, select "Pages" sub menu on the left pane, and choose "gh-pages branch" as "Source" (You won't see this choice if the GitHub Actions job has never been successfully completed). See [First Deployment with GITHUB_TOKEN](https://github.com/marketplace/actions/github-pages-action#%EF%B8%8F-first-deployment-with-github_token) for details, since we use [https://github.com/marketplace/actions/github-pages-action](https://github.com/marketplace/actions/github-pages-action) for this feature.

After choosing "gh-pages branch" as "Source", press "Rerun-jobs" button of the job (choose the job from the list on "Actions" tab, then you'll see the button), to publish correctly.

You will see the [https://togostanza.github.io/example-stanza-repo](https://togostanza.github.io/example-stanza-repo). Note that this URL is corresponding to [https://github.com/togostanza/example-stanza-repo](https://github.com/togostanza/example-stanza-repo).

NOTE 1: If you forked a stanza repository, the action will not run on the forked repository. You need to enable GitHub Actions in the Actions tab of the forked repository. See https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows for details.

NOTE 2: As default, the stanza repository is configured to be deployed from `main` branch, which is the recent default branch setting on GitHub. If you want to deploy from a branch other than `main` (e.g. `master`), you need to update the `branches` value on `.github/workflow/publish.yml` to change the conditions for invoking the workflow.

## Embedding stanza

Now your repository is hosted by GitHub pages and publicly accessible.
A great way to try it out is to use online IDE services like [JSFiddle](https://jsfiddle.net/) or [Codepen](https://codepen.io//).

Open the stanza page on GitHub pages. Then copy and paste the HTML snippet shown on the stanza page into the HTML field of these services.

The snippet will be like this (the subdomain part of the URL, represented by OWNER, should be different):

```html
<script
  type="module"
  src="https://OWNER.github.io/example-stanza-repo/hello.js"
  async
></script>

<togostanza-hello say-to="world"></togostanza-hello>
```

If you customize some parameters on the customize tab on the stanza page, a different snippet will be generated.
For example, If you change the color to blue, and change it to say hello to "stanza users", you will get the following HTML snippet:

```html
<script
  type="module"
  src="https://OWNER.github.io/example-stanza-repo/hello.js"
  async
></script>

<style>
  togostanza-hello {
    --greeting-color: #0000ff;
  }
</style>

<togostanza-hello say-to="stanza users"></togostanza-hello>
```

You can put this snippet to the online IDE service and see it in action.

Stanzas receive the parameters via HTML attribute values. In this example, `say-to` is what it is. If you change this value, the stanza will be updated.

Here, `--greeting-color` is a CSS variable. We use CSS variables to allow styling of stanzas from outside (the pages embedding the stanza). In this way, stanzas can provide customizable points of styling as parameters via these variables. See [Using CSS custom properties (variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) for more information about CSS variables.

## See how it works

Let's move on the internal of the stanza.

### Stanza directory layout

Doing `togostanza generate stanza` has generated the following.

```
stanzas/hello
├── assets/
├── index.js
├── metadata.json
├── README.md
├── stanza.scss
└── templates/
    └── stanza.html.hbs
```

### Metadata

`metadata.json` describes the stanza itself. This contains the basic information (appears in "Overview" tab), customizable items (appears in "Customize" tab) and events that can be handled by the stanza (appears in "Events" tab).

```json
{
  "@context": {
    "stanza": "http://togostanza.org/resource/stanza#"
  },
  "@id": "hello",
  "stanza:label": "Hello",
  "stanza:definition": "My description.",
  "stanza:type": "Stanza",
  "stanza:display": "Text",
  "stanza:provider": "",
  "stanza:license": "MIT",
  "stanza:author": "Stanza Togo",
  "stanza:address": "togostanza@example.com",
  "stanza:contributor": [],
  "stanza:created": "2020-10-08",
  "stanza:updated": "2020-10-08",
  "stanza:parameter": [
    {
      "stanza:key": "say-to",
      "stanza:type": "string",
      "stanza:example": "world",
      "stanza:description": "who to say hello to",
      "stanza:required": false
    }
  ],
  "stanza:menu-placement": "bottom-right",
  "stanza:style": [
    {
      "stanza:key": "--greeting-color",
      "stanza:type": "color",
      "stanza:default": "#000",
      "stanza:description": "text color of greeting"
    },
    {
      "stanza:key": "--greeting-align",
      "stanza:type": "single-choice",
      "stanza:choice": ["left", "center", "right"],
      "stanza:default": "center",
      "stanza:description": "text align of greeting"
    }
  ],
  "stanza:incomingEvent": [],
  "stanza:outgoingEvent": []
}
```

The stanza page that you have seen was generated using this information.
This file contains information about the stanza itself, as well as variables for styling and parameters.
See [Reference](./Reference.md#stanza-metadata) for details.

### Stanza class

Look into `stanzas/hello/index.js`.

```jsx
// stanzas/hello/index.js

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

This defines the behavior of the stanza. When the stanza is embedded, `render()` method of this class is called.

The class defines how the stanza works. The parameters passed to the stanza are accessible via `this.params`.

Calling `this.renderTemplate()` renders the stanza, using `templates/stanza.html.hbs` template with `parameters`.

In this example, we generate the greeting message interpolating `this.params['say-to']` and use the `greeting` in the view template, `stanza.html.hbs`.

Since we have specified `string` as the type of `say-to` parameter in metadata (as the value for `stanza:type`), `this.params['say-to']` will come as a string as passed to stanza. See [Reference](./Reference.md#possible-values-for-stanzatype) for details.

### View template

Look into the template:

```html
<!-- stanzas/hello/templates/stanza.html.hbs -->
<p>{{greeting}}</p>
```

Templates are written in [Handlebars](http://handlebarsjs.com/). With `{{...}}` notation, we can obtain values of `parameters` object passed to `this.renderTemplate()` method.

In this example, this stanza outputs `greeting` wrapping `<p>` and `</p>`.

### Styling

To control the style of the stanza, use `style.scss`. The file is written in SCSS, which is a superset of CSS. This means essentially all valid CSS is also valid as SCSS. See [Sass: Syntax](https://sass-lang.com/documentation/syntax) for details (SCSS is a syntax of Sass).

The SCSS generated by default is as follows:

```scss
// stanzas/hello/style.scss

// Load the repository-wide global style here. The actual file is located at ../common.scss for details.
@use '@/common.scss';

// The following is just an example. Feel free to modify it.
// --greeting-color and --greeting-align are style variables, which are defined in metadata.json.
main {
  padding: 1rem 2rem;
}

p.greeting {
  margin: 0;
  font-size: 24px;
  color: var(--greeting-color);
  text-align: var(--greeting-align);
}
```

As mentioned in the comment, `@use '@/common.scss';` loads `common.scss` file, which is used for repository-wide global style definition.

You may notice that `var(--greeting-color)` and `var(--greeting-align)` are used here. This way, you can use CSS variables as an actual style specification.

## Fetching data via RESTful APIs

Let's look at an example of issuing an HTTP GET request and display the data.

As an example, let's create a stanza that uses [ipify.org](http://ipify.org/) to display the IP address of the source of the access. In order to issue an HTTP request, we use the `fetch()` API [Fetch API - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

```javascript
// stanzas/hello/index.js

import Stanza from 'togostanza/stanza';

export default class Hello extends Stanza {
  async render() {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();

    console.log(data); // {"ip": "..."}

    this.renderTemplate({
      template: 'stanza.html.hbs',
      parameters: {
        greeting: `Hello, you're accessing from ${data.ip}!`,
      },
    });
  }
}
```

Here, the response from [ipify.org](http://ipify.org) is stored in `data`. The greeting message is constructed from `data`. Finally the stanza displays something like "Hello, you're accessing from 192.0.2.0".

## Handling errors on HTTP requests

HTTP endpoints may return 4xx or 5xx errors, or network error can happen during the request.
This section explains how to handle such cases.

`fetch()` will only throws exceptions on network errors. HTTP responses with erroneous status codes (such as 4xx or 5xx) does not throw exceptions. You need to handle these errors by checking the value of `res.ok` (boolean). If you need more detailed status codes, use `res.code`.

Example:

```javascript
// stanzas/hello/index.js

import Stanza from 'togostanza/stanza';

export default class Hello extends Stanza {
  async render() {
    try {
      const res = await fetch('https://example.com/may-cause-errors');

      console.log(res.ok); // true or false
      console.log(res.status); // 200, ...

      switch (res.status) {
        case '200':
          console.log('OK');
          break;
        case '404':
          console.warn('Not found');
          break;
        case '500':
          console.warn('Internal server error');
          break;
        default:
          console.warn('other HTTP errors');
      }
    } catch (e) {
      console.error(e); // network error
    }
  }
}
```

## Parameter type conversion

For the parameters received by the stanza, the type can be specified using `stanza:type`. The default value is `string`. This means that the string passed to stanza's attribute value will be stored in `this.params` verbatim.

In the case of parameters that accept numbers, for example, it may be troublesome to do the conversion from string to number, so by specifying `number` for `stanza:type`, Togostanza will do the conversion for you. Take a look at the example.

### Number

Consider `the-number` stanza, which takes the parameter `n`. First, let's define it as a string for an illustration:

```json
...
"stanza:parameter": [
    {
      "stanza:key": "n",
      "stanza:type": "string",
      "stanza:example": "42",
      "stanza:description": "the number",
      "stanza:required": false
    }
],
...
```

The stanza class should look like this:

```javascript
// stanzas/the-number/index.js

import Stanza from 'togostanza/stanza';

export default class TheNumber extends Stanza {
  async render() {
    const n = this.params.n;

    this.renderTemplate({
      template: 'stanza.html.hbs',
      parameters: {
        message: `The number is ${n}. Next is ${n + 1}.`,
      },
    });
  }
}
```

The template should be like this:

```html
{{! stanzas/the-number/templates/stanza.html.hbs }}

<p>{{message}}</p>
```

When you open the preview of the stanza, you will see:

> The number is 42. The next is 421.

This is because `this.params.n` is a `string`, so `"42" + 1` is evaluated and a string concatenation is performed, resulting in `"421"`. Now, let's treat `this.params.n` as a `number`, so that we can get `43` as the successor of the value `42`, given through `n`.

Update `metadata.json` as follows:

```json
...
"stanza:parameter": [
    {
      "stanza:key": "n",
      "stanza:type": "number",
      "stanza:example": 42,
      "stanza:description": "the number",
      "stanza:required": false
    }
],
...
```

Two changes were made: (1) `stanza:type` was changed from `string` to `number`, and (2) `stanza:example` was changed from `"42"` (string) to `42` (number).

As you can see, you need to write values in `stanza:example` with the type according to `stanza:type`. Here, the stanza class is unchanged. Now you should see that it works fine:

> The number is 42. The next is 43.

### Boolean

The boolean type is another commonly used type. Let's consider `yes-no` stanza that displays `"yes"` when given `true` and `"no"` when given `false`.

This time, we will specify `boolean` for `stanza:type`:

```json
{
  "stanza:key": "flag",
  "stanza:type": "boolean",
  "stanza:example": true,
  "stanza:description": "true or false",
  "stanza:required": true
}
```

The stanza class should look like this:

```javascript
// stanzas/yes-no/index.js

import Stanza from 'togostanza/stanza';

export default class YesNo extends Stanza {
  async render() {
    this.renderTemplate({
      template: 'stanza.html.hbs',
      parameters: {
        message: this.params.flag ? 'yes' : 'no',
      },
    });
  }
}
```

The template should be like this:

```html
{{! stanzas/yes-no/templates/stanza.html.hbs }}

<p>{{message}}</p>
```

Note that Boolean has a special way of passing values compared to values of other types.

When embedding a stanza, it is sufficient to give the attribute name to represent true:

```html
<togostanza-yes-no flag></togostanza-yes-no>
```

This results in

> yes

On the other hand,

```html
<togostanza-yes-no></togostanza-yes-no>
```

results in

> no

This may seem a little strange, but when you consider stanza as an HTML element, this behavior is reasonable. See [https://www.w3.org/TR/html52/infrastructure.html#sec-boolean-attributes](https://www.w3.org/TR/html52/infrastructure.html#sec-boolean-attributes) for details.

### JSON

If you want to receive a structured value, it is convenient to use `json` for `stanza:type`.

Now, let's make `extract-value` stanza, which takes a JSON object, extracts the value of the `value` property passed via `data` parameter, and displays it.

This time, we will specify `json` for `stanza:type` and give an immediate JSON object to `stanza:example`:

```json
...
"stanza:parameter": [
  {
    "stanza:key": "data",
    "stanza:type": "json",
    "stanza:example": { "value": 42 },
    "stanza:description": "a object",
    "stanza:required": true
  }
],
...
```

The stanza class should look like this:

```javascript
// stanzas/extract-value/index.js

import Stanza from 'togostanza/stanza';

export default class ExtractValue extends Stanza {
  async render() {
    this.renderTemplate({
      template: 'stanza.html.hbs',
      parameters: {
        message: `The value is ${this.params.data.value}.`,
      },
    });
  }
}
```

The template should be like this:

```html
{{! stanzas/extract-value/templates/stanza.html.hbs }}

<p>{{message}}</p>
```

This stanza will display

> The value is 42.

when embedded as

```html
<togostanza-extract-value data='{"value":42}'></togostanza-extract-value>
```

Here `{&quot;value&quot;:42}` is the HTML escaped value of `{"value": 42}`.

### Other types

See https://github.com/togostanza/togostanza/blob/master/doc/Reference.md#possible-values-for-stanzatype for other supported types.
