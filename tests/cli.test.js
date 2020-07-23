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
      expect(status).toBe(0);

      expect(fixturify.readSync('.')).toMatchSnapshot();
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
      expect(status).toBe(0);

      expect(fixturify.readSync('.')).toMatchSnapshot();
    });
  });
});

describe('upgrade', () => {
  test('move stanza into stanzas/', () => {
    withinTmpdir(() => {
      fixturify.writeSync('.', {
        hello: {
          'metadata.json': '{}'
        }
      });

      const {stdout, stderr, status} = togostanza(['upgrade']);

      expect(stdout.replace(/^Time elapsed: .*$/m, '')).toMatchSnapshot();
      expect(stderr).toMatchSnapshot();
      expect(status).toBe(0);

      expect(fixturify.readSync('.')).toMatchSnapshot();
    });
  });

  test('convert Stanza() to default exported function', () => {
    withinTmpdir(() => {
      fixturify.writeSync('stanzas/hello', {
        'index.js': 'Stanza(function(stanza, params) {});'
      })

      const {stdout, status} = togostanza(['upgrade']);

      expect(stdout).toContain('1 ok');
      expect(status).toBe(0);

      expect(fs.readFileSync('stanzas/hello/index.js', 'utf8')).toBe('export default function hello(stanza, params) {}')
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
        '--skip-install',
        '--skip-git',
      ]);

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

      const build = togostanza(['build'], {timeout: 30_000});

      expect(build.status).toBe(0);

      expect(walkSync('dist', {
        ignore: [
          'node_modules'
        ]
      })).toMatchSnapshot();

      expect(fs.readFileSync('dist/hello.js', 'utf8')).toContain('function hello(stanza, params) {');
    });
  });
});

function togostanza(args, opts = {}) {
  const bin = path.resolve(__dirname, '../bin/togostanza.mjs');

  // --no-warnings is necessary to avoid including ESM warnings in the snapshot, which change with each test run
  // (not required in Node.js 14)
  const ps = spawnSync(process.argv0, ['--no-warnings', bin, ...args], {
    encoding: 'utf8',
    timeout: 3000,
    env: {
      ...process.env,
      FORCE_COLOR: '0'
    },
    ...opts
  });

  expect(ps.error).toBeUndefined();

  return ps;
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
