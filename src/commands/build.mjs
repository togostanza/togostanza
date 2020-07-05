import broccoli from 'broccoli';
import TreeSync from 'tree-sync';

import { composeTree, runWatcher } from './-build-internal.mjs';

export default async function build(_argv, {outputPath}) {
  const builder    = new broccoli.Builder(composeTree('.'));
  const outputTree = new TreeSync(builder.outputPath, outputPath);

  await runWatcher(builder, outputPath, (watcher) => {
    outputTree.sync();
    watcher.quit();
  });
}

export const optionDefinition = [
  {name: 'output-path', type: String, defaultValue: './dist'}
];
