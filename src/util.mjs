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

  if (!lookupInstalledPath(repositoryDir)) {
    console.error('togostanza must be locally installed.');
    process.exit(1);
  }
}
