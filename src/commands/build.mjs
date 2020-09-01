import TreeSync from 'tree-sync';
import broccoli from 'broccoli';
import commander from 'commander';

import { composeTree, runWatcher } from './-build-internal.mjs';

const command = new commander.Command()
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .command('build')
  .alias('b')
  .description('build stanzas for deployment')
  .option('-o, --output-path <dir>', 'output directory', './dist')
  .action(async ({outputPath}) => {
    await build(outputPath);
  });

export default command;

async function build(outputPath) {
  const builder    = new broccoli.Builder(composeTree('.', {environment: 'production'}));
  const outputTree = new TreeSync(builder.outputPath, outputPath);

  await runWatcher(builder, outputPath, (watcher) => {
    outputTree.sync();
    watcher.quit();
  });
}
