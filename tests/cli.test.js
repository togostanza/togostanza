import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

import { copySync, mkdtempSync, pathExistsSync, readFileSync, removeSync } from 'fs-extra';

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
        '--license',         'MIT',
        '--package-manager', packageManager,
        '--owner',           'ursm',
        '--repo',            'some-repo',
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

describe('generate stanza', () => {
  test('non-interactive', () => {
    withinTmpdir(() => {
      const {status, output} = togostanza(
        'generate', 'stanza', 'hello',
        '--label',      'LABEL',
        '--definition', 'DEFINITION',
        '--type',       'TYPE',
        '--context',    'CONTEXT',
        '--display',    'DISPLAY',
        '--provider',   'PROVIDER',
        '--license',    'LICENSE',
        '--author',     'AUTHOR',
        '--address',    'ADDRESS'
      );

      expect(status).toBe(0);
      expect(output).toMatchSnapshot();

      expect(readFileSync('stanzas/hello/metadata.json', 'utf8')).toMatchSnapshot();
      expect(readFileSync('stanzas/hello/index.js', 'utf8')).toMatchSnapshot();
      expect(readFileSync('stanzas/hello/templates/stanza.html.hbs', 'utf8')).toMatchSnapshot();
    });
  });
});

describe('upgrade', () => {
  test('move stanza into stanzas/', () => {
    withinTmpdir((here) => {
      copySync(path.resolve(__dirname, 'fixtures/upgrade/move-stanza-into-stanzas'), here);

      expect(pathExistsSync('hello/metadata.json')).toBe(true);

      const {status} = togostanza('upgrade');

      expect(status).toBe(0);

      expect(pathExistsSync('hello/metadata.json')).toBe(false);
      expect(pathExistsSync('stanzas/hello/metadata.json')).toBe(true);
    });
  });
});

function togostanza(...args) {
  const bin = path.resolve(__dirname, '../bin/togostanza.mjs');

  // --no-warnings is necessary to avoid including ESM warnings in the snapshot, which change with each test run
  // (not required in Node.js 14)
  return spawnSync(process.argv0, ['--no-warnings', bin, ...args], {encoding: 'utf8', timeout: 3000});
}

function withinTmpdir(cb) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'togostanza-'));

  try {
    const cwd = process.cwd();

    process.chdir(tmp);

    try {
      cb(tmp);
    } finally {
      process.chdir(cwd);
    }
  } finally {
    removeSync(tmp);
  }
}
