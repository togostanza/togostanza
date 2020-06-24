export function packagePath(fpath) {
  return new URL(fpath, import.meta.url).pathname;
}
