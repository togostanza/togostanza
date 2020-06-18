import { promises as fs } from 'fs';
import path from 'path';

import Handlebars from 'handlebars';
import commonjs from '@rollup/plugin-commonjs';
import connect from 'gulp-connect';
import glob from 'fast-glob';
import gulp from 'gulp';
import resolve from '@rollup/plugin-node-resolve';
import { rollup } from 'rollup';

const {parallel, series, src, watch} = gulp;

function packagePath(_path) {
  return new URL(_path, import.meta.url).pathname;
}

async function handlebarsTemplate(path, opts = {}) {
  const template = await fs.readFile(path, 'utf8');

  return Handlebars.compile(template, opts);
}

async function clean() {
  await fs.rmdir('dist', {recursive: true});
}

async function prepare() {
  await fs.mkdir('dist');
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

async function buildIndex() {
  const template = await handlebarsTemplate(packagePath('index.html.hbs'));

  await fs.writeFile('dist/index.html', template({
    stanzas: await Promise.all(allStanzas().map(({metadata}) => metadata))
  }));

  return src(packagePath('index.html.hbs')).pipe(connect.reload());
}

async function buildStanzaLib() {
  const bundle = await rollup({
    input: packagePath('stanza.js'),
    plugins: [resolve.default(), commonjs()]
  });

  await bundle.write({
    file: 'dist/stanza.js',
    format: 'esm'
  });

  return src(packagePath('stanza.js')).pipe(connect.reload());
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

  return src(['*/metadata.json', '*/**/*.js', '*/**/*.html', '!dist/**', '!node_modules/**']).pipe(connect.reload());
}

function serve() {
  connect.server({
    root:       'dist',
    livereload: true
  });
}

const buildAll = series(clean, prepare, buildIndex, buildStanzaLib, buildStanzas);

function _watch() {
  watch([
    packagePath('index.html.hbs'),
    packagePath('stanza.js'),
    '*/metadata.json',
    '*/**/*.js',
    '*/**/*.html',
    '!dist/**',
    '!node_modules/**'
  ], buildAll);
}

export default series(
  buildAll,
  parallel(
    serve,
    _watch
  )
);
