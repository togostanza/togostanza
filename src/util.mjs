import resolve from 'resolve';

export const packagePath = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

export function resolvePackage(name) {
  return resolve.sync(name, {basedir: packagePath});
}
