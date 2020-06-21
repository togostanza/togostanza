import { promises as fs } from 'fs';
import path from 'path';

import Handlebars from 'handlebars';
import commonjs from '@rollup/plugin-commonjs';
import glob from 'fast-glob';
import gulp from 'gulp';
import resolve from '@rollup/plugin-node-resolve';
import { rollup } from 'rollup';

import { createDevServer } from './dev-server.mjs';
import { packagePath } from './util.mjs';

const {parallel, series, watch} = gulp;

async function handlebarsTemplate(path, opts = {}) {
  const template = await fs.readFile(path, 'utf8');

  return Handlebars.compile(template, opts);
}

function allStanzas() {
  return glob.sync('*/metadata.json').map((metadataPath) => {
    const dir = path.dirname(metadataPath);

    return {
      id: path.basename(dir),

      get metadata() {
        return fs.readFile(metadataPath).then(JSON.parse);
      },

      get script() {
        return fs.readFile(path.join(dir, 'index.js'), 'utf8');
      },

      get templates() {
        const paths = glob.sync('templates/*.html', {cwd: dir});

        return Promise.all(paths.map(async (templatePath) => {
          return {
            name: path.basename(templatePath),
            spec: Handlebars.precompile(await fs.readFile(path.join(dir, templatePath), 'utf8'))
          };
        }));
      },

      get outer() {
        return fs.readFile(path.join(dir, '_header.html'), 'utf8').catch(() => null);
      }
    };
  });
}

async function clean() {
  await fs.rmdir('dist', {recursive: true});
}

async function prepare() {
  await fs.mkdir('dist');
}

async function buildIndex() {
  const template = await handlebarsTemplate(packagePath('index.html.hbs'));
  const stanzas  = await Promise.all(allStanzas().map(({metadata}) => metadata));

  await fs.writeFile(path.join('dist', 'index.html'), template({stanzas}));
}

async function buildStanzaLib() {
  const bundle = await rollup({
    input:   packagePath('stanza.js'),
    plugins: [resolve.default(), commonjs()]
  });

  await bundle.write({
    file:   path.join('dist', 'stanza.js'),
    format: 'esm'
  });
}

async function buildStanzas() {
  await Promise.all(allStanzas().map(async (stanza) => {
    const entrypoint = await handlebarsTemplate(packagePath('entrypoint.js.hbs'), {noEscape: true});
    const metadata   = await stanza.metadata;

    await fs.writeFile(path.join('dist', `${stanza.id}.js`), entrypoint({
      metadataJSON: JSON.stringify(metadata),
      script:       await stanza.script,
      templates:    await stanza.templates,
      outerJSON:    JSON.stringify(await stanza.outer)
    }));

    const help = await handlebarsTemplate(packagePath('help.html.hbs'));

    await fs.writeFile(path.join('dist', `${stanza.id}.html`), help({metadata}));
  }));
}

function serve() {
  const port = process.env.PORT || '8080';

  createDevServer('dist').listen(port, () => {
    console.log(`Development server listening at http://localhost:${port}`);
  });
}

const buildAll = series(
  clean,
  prepare,
  parallel(
    buildIndex,
    buildStanzaLib,
    buildStanzas
  )
);

function _watch() {
  watch([
    '*/**/*',
    '!dist/**'
  ], buildAll);
}

export default series(
  buildAll,
  parallel(
    serve,
    _watch
  )
);
