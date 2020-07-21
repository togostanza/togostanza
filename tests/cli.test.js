import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

import fixturify from 'fixturify';
import fs from 'fs-extra';
import walkSync from 'walk-sync';

test('--help', () => {
  const {stdout, status} = togostanza(['--help']);

  expect(stdout).toContain('Usage: togostanza [options] [command]');
  expect(status).toBe(0);
});

describe('init', () => {
  test.each([
    {packageManager: 'npm'},
    {packageManager: 'yarn'}
  ])('non-interactive (%p)', ({packageManager}) => {
    withinTmpdir(() => {
      const {output, status} = togostanza([
        'init', 'some-repo',
        '--license',         'MIT',
        '--package-manager', packageManager,
        '--owner',           'ursm',
        '--repo',            'some-repo',
        '--skip-install',
        '--skip-git'
      ]);

      expect(output).toMatchSnapshot();
      expect(fixturify.readSync('.')).toMatchSnapshot();
      expect(status).toBe(0);
    });
  });
});

describe('generate stanza', () => {
  test('non-interactive', () => {
    withinTmpdir(() => {
      const {output, status} = togostanza([
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
      ]);

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

      const {output, status} = togostanza(['upgrade']);

      expect(output).toMatchSnapshot();
      expect(fixturify.readSync('.')).toMatchSnapshot();
      expect(status).toBe(0);
    });
  });
});

describe('build', () => {
  test('simple', () => {
    withinTmpdir(() => {
      const init = togostanza([
        'init', 'some-repo',
        '--license',         'MIT',
        '--package-manager', 'yarn',
        '--owner',           'ursm',
        '--repo',            'some-repo',
        '--skip-git',
      ], {
        timeout: 30_000
      });

      expect(init.stderr).toContain('Getting Started');
      expect(init.status).toBe(0);

      process.chdir('some-repo');

      const generateStanza = togostanza([
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
      ]);

      expect(generateStanza.output).toMatchSnapshot();
      expect(generateStanza.status).toBe(0);

      const build = togostanza(['build']);

      expect(build.status).toBe(0);

      expect(walkSync('dist', {
        ignore: [
          'node_modules'
        ]
      })).toMatchSnapshot();

      expect(fs.readFileSync('dist/hello.js', 'utf8')).toContain('Stanza(');
    });
  });
});

function togostanza(args, opts = {}) {
  const bin = path.resolve(__dirname, '../bin/togostanza.mjs');

  // --no-warnings is necessary to avoid including ESM warnings in the snapshot, which change with each test run
  // (not required in Node.js 14)
  return spawnSync(process.argv0, ['--no-warnings', bin, ...args], {
    encoding: 'utf8',
    timeout: 3000,
    env: {
      FORCE_COLOR: '0'
    },
    ...opts
  });
}

function withinTmpdir(cb) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'togostanza-'));

  try {
    const cwd = process.cwd();

    process.chdir(tmp);

    try {
      cb(tmp);
    } finally {
      process.chdir(cwd);
    }
  } finally {
    fs.removeSync(tmp);
  }
}
