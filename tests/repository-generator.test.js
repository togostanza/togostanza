import { canonifyGitUrl, validRepositoryName } from '../src/generators/repository/index.mjs';

test.each([
  ['git@github.com:togostanza/togostanza.git', 'ssh://git@github.com/togostanza/togostanza.git'],
  ['https://github.com/togostanza/togostanza.git', 'https://github.com/togostanza/togostanza.git'],
  ['hoge', 'hoge'],
])('canonifyGitUrl(%s) -> %s', (from, to) => {
  expect(canonifyGitUrl(from)).toBe(to);
});

test.each([
  ['name', true],
  ['name-1', true],
  ['name_2', true],
  ['0name', true],
  ['foo/bar', false],
  ['@foo/bar', false],
  ['.name', false],
  ['-name', false],
  ['_name', false],
  ['name~', false],
])('validRepositoryName(%s) -> %s', (name, isValid) => {
  expect(validRepositoryName(name)).toBe(isValid);
});
