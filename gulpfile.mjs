import { promises as fs } from 'fs';
import path from 'path';

import Handlebars from 'handlebars';
import connect from 'gulp-connect';
import gulp from 'gulp';
import through2 from 'through2';

const {dest, parallel, series, src, watch} = gulp;

class StanzaProvider {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }

  async stanzas() {
    const dirents = await fs.readdir(this.rootPath, {withFileTypes: true});

    return Promise.all(dirents.filter((ent) => {
      return ent.isDirectory() && !ent.name.startsWith('.') && ent.name !== 'node_modules' && ent.name !== 'dist';
    }).map(async ({name}) => {
      const stanzaDir = path.join(providerPath, name);
      const metadata  = JSON.parse(await fs.readFile(path.join(stanzaDir, 'metadata.json')));

      if (name !== metadata['@id']) {
        throw new Error(`mismatch directory name ${stanzaDir} and its stanza id in metadata.json (${metadata["@id"]})`);
      }

      return metadata;
    }));
  }
}

const providerPath = path.resolve('.');
const templatePath = new URL('index.html.hbs', import.meta.url).pathname;

async function clean() {
  await fs.rmdir('dist', {recursive: true});
}

async function prepare() {
  await fs.mkdir('dist');
}

async function buildIndex() {
  const provider = new StanzaProvider(providerPath);
  const stanzas  = await provider.stanzas();

  return src(templatePath)
    .pipe(through2.obj((file, _, cb) => {
      file.basename = 'index.html';
      file.contents = Buffer.from(Handlebars.compile(file.contents.toString())({stanzas}));

      cb(null, file);
    }))
    .pipe(dest('dist/'))
    .pipe(connect.reload());
}

async function buildStanzas() {
  const provider = new StanzaProvider(providerPath);
  const stanzas  = await provider.stanzas();

  for (const stanza of stanzas) {
    const id = stanza['@id'];

    await fs.mkdir(path.join('dist', id));
    await fs.copyFile(path.join(id, 'index.js'), path.join('dist', `${id}.js`));
  }
}

function serve() {
  connect.server({
    root:       'dist',
    livereload: true
  });
}

const buildAll = series(clean, prepare, buildStanzas, buildIndex);

function _watch() {
  watch([templatePath, '*/metadata.json'], buildIndex);
}

export default series(
  buildAll,
  parallel(
    serve,
    _watch
  )
);
