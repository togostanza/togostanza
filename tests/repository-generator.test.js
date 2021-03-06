// import { canonifyGitUrl, errorOfRepositoryName, getHttpsRepositoryUrlIfPossible } from '../src/generators/repository/index.mjs';

test.skip.each([
  ['git@github.com:togostanza/togostanza.git', 'ssh://git@github.com/togostanza/togostanza.git'],
  ['https://github.com/togostanza/togostanza.git', 'https://github.com/togostanza/togostanza.git'],
  ['hoge', 'hoge'],
])('canonifyGitUrl(%s) -> %s', (from, to) => {
  expect(canonifyGitUrl(from)).toBe(to);
});

test.skip.each([
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
])('isValidRepositoryName(%s) -> %s', (name, isValid) => {
  if (isValid) {
    expect(errorOfRepositoryName(name)).toBeNull();
  } else {
    expect(errorOfRepositoryName(name)).not.toBeNull();
  }
});

test.skip.each([
  ['git@github.com:togostanza/togostanza.git', 'https://github.com/togostanza/togostanza.git'],
  ['ssh://git@github.com/togostanza/togostanza.git', 'https://github.com/togostanza/togostanza.git'],
  ['https://github.com/togostanza/togostanza.git', 'https://github.com/togostanza/togostanza.git'],
  ['hoge', 'hoge'],
])('getHttpsRepositoryUrlIfPossible(%s) -> %s', (from, to) => {
  expect(getHttpsRepositoryUrlIfPossible(from)).toBe(to);
});
