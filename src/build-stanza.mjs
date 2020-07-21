import { promises as fs } from 'fs';
import path from 'path';

import BroccoliPlugin from 'broccoli-plugin';
import RSVP from 'rsvp';
import _Handlebars from 'handlebars';
import walkSync from 'walk-sync';

import { packagePath } from './util.mjs';

const Handlebars = _Handlebars.create();

Handlebars.registerHelper('array', function() {
  return Array.from(arguments).slice(0, -1);
});

Handlebars.registerHelper('to-json', function(val) {
  return JSON.stringify(val);
});

async function handlebarsTemplate(fpath, opts = {}) {
  const hbs = await fs.readFile(fpath, 'utf8');

  return Handlebars.compile(hbs, opts);
}

export default class BuildStanza extends BroccoliPlugin {
  constructor(inputNode, options) {
    super([inputNode], options);
  }

  async build() {
    const stanzas = this.allStanzas;

    await Promise.all([
      this.buildIndex(stanzas),
      this.buildStanzas(stanzas)
    ]);
  }

  async buildIndex(stanzas) {
    const template = await handlebarsTemplate(path.join(packagePath, 'src', 'index.html.hbs'));
    const metadata = await Promise.all(stanzas.map(({metadata}) => metadata));

    this.output.writeFileSync('index.html', template({
      stanzas: metadata
    }));
  }

  async buildStanzas(stanzas) {
    const templates = await RSVP.hash({
      entrypoint: handlebarsTemplate(path.join(packagePath, 'src', 'entrypoint.js.hbs'), {noEscape: true}),
      help:       handlebarsTemplate(path.join(packagePath, 'src', 'help.html.hbs'))
    });

    await Promise.all(stanzas.map(stanza => this.buildStanza(stanza, templates)));
  }

  async buildStanza(stanza, templates) {
    const metadata = await stanza.metadata;

    this.output.writeFileSync(`${stanza.id}.js`, templates.entrypoint({
      metadata,
      templates: await stanza.templates,
      outer:     await stanza.outer
    }));

    this.output.writeFileSync(`${stanza.id}.html`, templates.help({metadata}));

    this.output.mkdirSync(stanza.id);
    await fs.copyFile(stanza.scriptPath, path.join(this.outputPath, stanza.id, 'index.js'));
  }

  get allStanzas() {
    const repositoryDir = this.inputPaths[0];

    return walkSync(repositoryDir, {
      globs:           ['stanzas/*/metadata.json'],
      includeBasePath: true
    }).map((metadataPath) => {
      const stanzaDir = path.dirname(metadataPath);

      return {
        id:         path.basename(stanzaDir),
        scriptPath: path.join(stanzaDir, 'index.js'),

        get metadata() {
          return fs.readFile(metadataPath).then(JSON.parse);
        },

        get templates() {
          const paths = walkSync(stanzaDir, {
            globs:           ['templates/*'],
            includeBasePath: true
          });

          return Promise.all(paths.map(async (templatePath) => {
            const name = path.basename(templatePath, '.hbs');

            return {
              name,

              spec: Handlebars.precompile(await fs.readFile(templatePath, 'utf8'), {
                noEscape: path.extname(name) !== '.html'
              })
            };
          }));
        },

        get outer() {
          return fs.readFile(path.join(stanzaDir, '_header.html'), 'utf8').catch(() => null);
        }
      };
    });
  }
}
