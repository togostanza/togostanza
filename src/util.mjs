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
