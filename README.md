<p align="center">
  <img src="http://togostanza.org/img/logotype.svg" alt="TogoStanza" width="320" />
</p>

`togostanza` is a command to build TogoStanza stanzas of JavaScript backended version. It includes:

* Stanza template generator for scaffolding
* Stanza builder
* Built-in web server for stanza development

## Usage

```
$ npx togostanza init
```

## Development

### How to release

1. Bump the version in `package.json`.
2. `npx jest -u` to update snapshots to include the new version.
3. `git push` to publish.