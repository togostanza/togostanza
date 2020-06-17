import { promises as fs } from 'fs';
import path from 'path';

import Handlebars from 'handlebars';
import gulp from 'gulp';

const {series} = gulp;

const providerPath = path.resolve('.');

async function clean() {
  await fs.rmdir('dist', {recursive: true});
}

async function prepare() {
  await fs.mkdir('dist');
}

export async function build() {
  const dirents = await fs.readdir(providerPath, {withFileTypes: true});

  const stanzas = await Promise.all(dirents.filter((ent) => {
    return ent.isDirectory() && !ent.name.startsWith('.') && ent.name !== 'node_modules' && ent.name !== 'dist';
  }).map(async ({name}) => {
    const stanzaDir = path.join(providerPath, name);
    const metadata  = JSON.parse(await fs.readFile(path.join(stanzaDir, 'metadata.json')));

    if (name !== metadata['@id']) {
      throw new Error(`mismatch directory name ${stanzaDir} and its stanza id in metadata.json (${metadata["@id"]})`);
    }

    return metadata;
  }));

  const html = Handlebars.compile(await fs.readFile(new URL('index.html.hbs', import.meta.url).pathname, 'utf8'))({stanzas});

  await fs.writeFile('dist/index.html', html);
}

export default series(clean, prepare, build);
