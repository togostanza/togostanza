import { canonifyGitUrl } from '../src/generators/repository/index.mjs';

test.each([
  ['git@github.com:togostanza/togostanza.git', 'ssh://git@github.com/togostanza/togostanza.git'],
  ['https://github.com/togostanza/togostanza.git', 'https://github.com/togostanza/togostanza.git'],
  ['hoge', 'hoge'],
])('canonifyGitUrl(%s) -> %s', (from, to) => {
  expect(canonifyGitUrl(from)).toBe(to);
});
