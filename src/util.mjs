import path from 'path';
import { readFileSync } from 'fs';

import _Handlebars from 'handlebars';
import resolve from 'resolve';

export const packagePath = decodeURIComponent(new URL('..', import.meta.url).pathname).replace(/\/$/, '');
export const Handlebars  = _Handlebars.create();

Handlebars.registerHelper('to-json', function(val) {
  return JSON.stringify(val);
});

export function handlebarsTemplate(filename, opts = {}) {
  const hbs = readFileSync(path.join(packagePath, 'src', 'templates', filename), 'utf8');

  return Handlebars.compile(hbs, opts);
}

export function resolvePackage(name) {
  return resolve.sync(name, {basedir: packagePath});
}

export function lookupInstalledPath(repositoryDir) {
  let packageJsonPath;

  try {
    packageJsonPath = resolve.sync('togostanza/package.json', {basedir: repositoryDir});
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      return null;
    } else {
      throw e;
    }
  }

  return path.resolve(packageJsonPath, '..');
}

export function ensureTogoStanzaIsLocallyInstalled(repositoryDir) {
  if (process.env.NODE_ENV === 'test') { return; }

  let packageJSON;

  try {
    packageJSON = JSON.parse(readFileSync(path.join(repositoryDir, 'package.json')));
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error('package.json is missing. Make sure you are in the stanza repository directory.');
      process.exit(1);
    } else if (e instanceof SyntaxError) {
      console.error(`Failed to parse package.json: ${e.message}`);
      process.exit(1);
    } else {
      throw e;
    }
  }

  if (!packageJSON.dependencies || !packageJSON.dependencies.togostanza) {
    console.error('togostanza is not specified as a dependency in package.json. Make sure you are in the stanza repository directory.');
    process.exit(1);
  }

  if (!lookupInstalledPath(repositoryDir)) {
    console.error('togostanza is not installed locally. Try `npm install` or `yarn install`.');
    process.exit(1);
  }
}
