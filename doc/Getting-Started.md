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

NOTE: You need to do `npx togostanza/togostanza init` before we release the first version of togostanza to npmjs.org.

Then you will be asked a few questions. Enter the GitHub repository URL for the first question:

```
$ npx togostanza/togostanza init
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
   create stanzas/hello/stanza.scss
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

Open the URL on your browser.

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
