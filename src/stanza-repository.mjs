import path from 'path';
import { promises as fs } from 'fs';

import walkSync from 'walk-sync';

import { Handlebars } from './util.mjs';

export default class StanzaRepository {
  constructor(dir) {
    this.rootPath = dir;
  }

  get allStanzas() {
    return walkSync(this.rootPath, {
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

        get readme() {
          return fs.readFile(path.join(stanzaDir, 'README.md'), 'utf8').catch((e) => {
            if (e.code === 'ENOENT') {
              return null;
            } else {
              throw e;
            }
          });
        },

        get templates() {
          const paths = walkSync(stanzaDir, {
            globs:           ['templates/*'],
            includeBasePath: true
          });

          return Promise.all(paths.map(async (templatePath) => {
            const basename = path.basename(templatePath);
            const isHTML   = /\.html(?:\.hbs)?$/.test(basename);

            return {
              name: basename,

              spec: Handlebars.precompile(await fs.readFile(templatePath, 'utf8'), {
                noEscape: !isHTML
              })
            };
          }));
        },

        filepath(...paths) {
          return path.join(stanzaDir, ...paths);
        }
      };
    });
  }
}
