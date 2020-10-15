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

NOTE: You need to do `npx togostanza init` before we release the first version of togostanza to npmjs.org.

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

Open the URL on your browser. The overview of hello stanza will appear. On the right pane, you will see the HTML snippet and the preview. You can use this snippet to embed the stanza on any page you want. The preview shows the stanza working.

In "Customize" tab, you can customize the behavior of the stanza. The preview and the snippet (on the right pane) will update  corresponding to the values of the fields (on the left pane).

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

Due to technical restrictions, this first deployment will fail even if the action have completed successfully. In order to resolve this problem, go "Settings" tab on the repository and choose "gh-pages branch" as "Source" (You won't see this choice if the GitHub Actions job has never been successfully completed). See [First Deployment with GITHUB_TOKEN](https://github.com/marketplace/actions/github-pages-action#%EF%B8%8F-first-deployment-with-github_token) for details, since we use [https://github.com/marketplace/actions/github-pages-action](https://github.com/marketplace/actions/github-pages-action) for this feature.

After choosing "gh-pages branch" as "Source", press "Rerun-jobs" button to publish correctly.

You will see the [https://togostanza.github.io/example-stanza-repo](https://togostanza.github.io/example-stanza-repo). Note that this URL is corresponding to [https://github.com/togostanza/example-stanza-repo](https://github.com/togostanza/example-stanza-repo).

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

`metadata.json` describes the stanza itself. This contains the basic information (appears in "Overview" tab) and customizable items (appears in "Customize" tab).

```json
{
  "@context": {
    "stanza": "http://togostanza.org/resource/stanza#"
  },
  "@id": "hello",
  "stanza:label": "Hello",
  "stanza:definition": "My description.",
  "stanza:type": "Stanza",
  "stanza:context": "Environment",
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
      "stanza:example": "world",
      "stanza:description": "who to say hello to",
      "stanza:required": false
    }
  ],
  "stanza:about-link-placement": "bottom-right",
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
      "stanza:choice": [
        "left",
        "center",
        "right"
      ],
      "stanza:default": "center",
      "stanza:description": "text align of greeting"
    }
  ]
}
```

The stanza page that you have seen was generated using this information.

## Stanza function

Look into `stanzas/hello/index.js`.

```jsx
export default async function hello(stanza, params) {
  stanza.render({
    template: 'stanza.html.hbs',
    parameters: {
      greeting: `Hello, ${params['say-to']}!`
    }
  });
}
```

This defines the behavior of the stanza. When the stanza is embedded, this function is called.

This function defines how the stanza works. The parameters passed to the stanza are accessible via `params` (the second argument of the function).

Calling `stanza.render()` renders the stanza, using `templates/stanza.html.hbs` template with `parameters`.

In this example, we generate the greeting message interpolating `params['say-to']` and use the `greeting` in the view template, `stanza.html.hbs`.

### View template

Look into the template:

```
<!-- stanzas/hello/templates/stanza.html.hbs -->
<p>{{greeting}}</p>
```

Templates are written in [Handlebars](http://handlebarsjs.com/). With `{{...}}` notation, we can obtain values of `parameters` object passed to `stanza.render()` method.

In this example, this stanza outputs `greeting` wrapping `<p>` and `</p>`.

## Fetching data via RESTful APIs

Let's look at an example of issuing an HTTP GET request and display the data.

As an example, let's create a stanza that uses [ipify.org](http://ipify.org/) to display the IP address of the source of the access. In order to issue an HTTP request, we use the `fetch()` API [Fetch API - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

```javascript
// stanzas/hello/index.js
export default async function hello(stanza, params) {
  const res  = await fetch('https://api.ipify.org?format=json');
  const data = await res.json();

  console.log(data); // {"ip": "..."}

  stanza.render({
    template: 'stanza.html.hbs',
    parameters: {
      greeting: `Hello, you're accessing from ${data.ip}!`
    }
  });
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
export default async function hello(stanza, params) {
  try {
    const res = await fetch('https://example.com/may-cause-errors');

    console.log(res.ok); // true or false
    console.log(res.status); // 200, ...

    switch (res.status) {
      case "200":
        console.log("OK");
        break;
      case "404":
        console.warn("Not found");
        break;
      case "500":
        console.warn("Internal server error");
        break;
      default:
        console.warn("other HTTP errors");
    }
  } catch (e) {
    console.error(e); // network error
  }

```
