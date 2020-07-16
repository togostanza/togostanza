import path from 'path';
import { execFileSync } from 'child_process';

const bin = path.resolve(__dirname, '..', 'bin', 'togostanza.mjs');

test('--help', () => {
  const stdout = execFileSync(bin, ['--help'], {encoding: 'utf8'});

  expect(stdout).toContain('Usage: togostanza [options] [command]');
});
