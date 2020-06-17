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

  const stanzaJsPath = new URL('stanza.js', import.meta.url).pathname;

  return src(templatePath)
    .pipe(through2.obj((file, _, cb) => {
      file.basename = 'index.html';
      file.contents = Buffer.from(Handlebars.compile(file.contents.toString())({stanzas}));

      cb(null, file);
    }))
    .pipe(src(stanzaJsPath))
    .pipe(dest('dist/'))
    .pipe(connect.reload());
}

const jsTemplate = Handlebars.compile(`
  window.__metadata__ = {{metadataJSON}};
  window.__outer__    = {{outerJSON}};

  import Stanza from './stanza.js';

  {{script}}
`, {noEscape: true});

async function buildStanzas() {
  return src(['*/index.js', '!dist/**', '!node_modules/**'])
    .pipe(through2.obj(async function(file, _, cb) {
      const id = path.dirname(file.relative);

      const metadata = JSON.parse(await fs.readFile(path.join(id, 'metadata.json')));

      let header = null;

      try {
        header = await fs.readFile(path.join(id, '_header.html'), 'utf8');
      } catch (e) {
        // do nothing
      }

      // TODO pass template functions
      await fs.writeFile(path.join('dist', `${id}.js`), jsTemplate({
        script:       file.contents.toString(),
        metadataJSON: JSON.stringify(metadata),
        outerJSON:    JSON.stringify(header)
      }));

      // TODO build from html template
      await fs.writeFile(path.join('dist', `${id}.html`), `
        <html>
          <script type="module" src="./${id}.js"></script>
          <togostanza-${id}></togostanza-${id}>
        </html>
      `);

      cb();
    }));

//   for (const stanza of stanzas) {
//     const id = stanza['@id'];

//     await fs.mkdir(path.join('dist', id));
//     await fs.copyFile(path.join(id, 'index.js'), path.join('dist', `${id}.js`));
//   }
}

function serve() {
  connect.server({
    root:       'dist',
    livereload: true
  });
}

const buildAll = series(clean, prepare, buildStanzas, buildIndex);

function _watch() {
  watch([
    templatePath,
    '*/metadata.json',
    '*/*.js',
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
