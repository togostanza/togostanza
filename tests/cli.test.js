import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

import fixturify from 'fixturify';
import { mkdtempSync, removeSync } from 'fs-extra';

test('--help', () => {
  const {stdout, status} = togostanza('--help');

  expect(stdout).toContain('Usage: togostanza [options] [command]');
  expect(status).toBe(0);
});

describe('init', () => {
  test.each([
    {packageManager: 'npm'},
    {packageManager: 'yarn'}
  ])('non-interactive (%p)', ({packageManager}) => {
    withinTmpdir(() => {
      const {output, status} = togostanza(
        'init', 'some-repo',
        '--license',         'MIT',
        '--package-manager', packageManager,
        '--owner',           'ursm',
        '--repo',            'some-repo',
        '--skip-install',
        '--skip-git'
      );

      expect(output).toMatchSnapshot();
      expect(fixturify.readSync('.')).toMatchSnapshot();
      expect(status).toBe(0);
    });
  });
});

describe('generate stanza', () => {
  test('non-interactive', () => {
    withinTmpdir(() => {
      const {output, status} = togostanza(
        'generate', 'stanza', 'hello',
        '--label',      'LABEL',
        '--definition', 'DEFINITION',
        '--type',       'TYPE',
        '--context',    'CONTEXT',
        '--display',    'DISPLAY',
        '--provider',   'PROVIDER',
        '--license',    'LICENSE',
        '--author',     'AUTHOR',
        '--address',    'ADDRESS',
        '--timestamp',  '2020-10-05'
      );

      expect(output).toMatchSnapshot();
      expect(fixturify.readSync('.')).toMatchSnapshot();
      expect(status).toBe(0);
    });
  });
});

describe('upgrade', () => {
  test('move stanza into stanzas/', () => {
    withinTmpdir((here) => {
      fixturify.writeSync('.', {
        hello: {
          'metadata.json': '{}'
        }
      });

      const {output, status} = togostanza('upgrade');

      expect(output).toMatchSnapshot();
      expect(fixturify.readSync('.')).toMatchSnapshot();
      expect(status).toBe(0);
    });
  });
});

function togostanza(...args) {
  const bin = path.resolve(__dirname, '../bin/togostanza.mjs');

  // --no-warnings is necessary to avoid including ESM warnings in the snapshot, which change with each test run
  // (not required in Node.js 14)
  return spawnSync(process.argv0, ['--no-warnings', bin, ...args], {
    encoding: 'utf8',
    timeout: 3000,
    env: {
      FORCE_COLOR: '0'
    }
  });
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
