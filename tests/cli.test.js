import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

import { mkdtempSync, pathExistsSync, readFileSync, removeSync } from 'fs-extra';

test('--help', () => {
  const {stdout} = togostanza('--help');

  expect(stdout).toContain('Usage: togostanza [options] [command]');
});

describe('init', () => {
  test.each([
    {packageManager: 'npm'},
    {packageManager: 'yarn'}
  ])('non-interactive (%p)', ({packageManager}) => {
    withinTmpdir(() => {
      const {status, output} = togostanza(
        'init', 'some-repo',
        '--license', 'MIT',
        '--package-manager', packageManager,
        '--owner', 'ursm',
        '--repo', 'some-repo',
        '--skip-install',
        '--skip-git'
      );

      expect(status).toBe(0);
      expect(output).toMatchSnapshot();

      expect(readFileSync('some-repo/README.md', 'utf8')).toMatchSnapshot();
      expect(readFileSync('some-repo/package.json', 'utf8')).toMatchSnapshot();
      expect(readFileSync('some-repo/.github/workflows/publish.yml', 'utf8')).toMatchSnapshot();
    });
  });
});

function togostanza(...args) {
  const bin = path.resolve(__dirname, '..', 'bin', 'togostanza.mjs');

  return spawnSync(bin, args, {encoding: 'utf8', timeout: 3000});
}

function withinTmpdir(cb) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'togostanza-'));

  try {
    const cwd = process.cwd();

    process.chdir(tmp);

    try {
      cb();
    } finally {
      process.chdir(cwd);
    }
  } finally {
    removeSync(tmp);
  }
}
