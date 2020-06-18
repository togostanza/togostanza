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

async function buildIndex() {
  const template = await handlebarsTemplate(packagePath('index.html.hbs'));
  const paths    = await glob('*/metadata.json');
  const stanzas  = await Promise.all(paths.map(async (path) => JSON.parse(await fs.readFile(path))));

  await fs.writeFile('dist/index.html', template({stanzas}));

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
  for (const metadataPath of await glob('*/metadata.json')) {
    const stanzaDir = path.dirname(metadataPath);
    const stanzaId  = path.basename(stanzaDir);
    const metadata  = JSON.parse(await fs.readFile(metadataPath));

    let header = null;

    try {
      header = await fs.readFile(path.join(stanzaDir, '_header.html'), 'utf8');
    } catch (e) {
      // do nothing
    }

    const templatePaths = await glob('templates/*.html', {cwd: stanzaDir});

    const templates = await Promise.all(templatePaths.map(async (templatePath) => {
      return {
        name: path.basename(templatePath),
        spec: Handlebars.precompile(await fs.readFile(path.join(stanzaDir, templatePath), 'utf8'))
      };
    }));

    const entrypoint = await handlebarsTemplate(packagePath('entrypoint.js.hbs'), {noEscape: true});
    const script     = await fs.readFile(path.join(stanzaDir, 'index.js'), 'utf8');

    await fs.writeFile(path.join('dist', `${stanzaId}.js`), entrypoint({
      script,
      templates,
      metadataJSON: JSON.stringify(metadata),
      outerJSON:    JSON.stringify(header)
    }));

    const help = await handlebarsTemplate(packagePath('help.html.hbs'));

    await fs.writeFile(path.join('dist', `${stanzaId}.html`), help({metadata}));
  }

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
