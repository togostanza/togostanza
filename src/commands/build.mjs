import path from 'path';

import TreeSync from 'tree-sync';
import broccoli from 'broccoli';
import commander from 'commander';

import { composeTree, runWatcher } from './-build-internal.mjs';
import { ensureTogoStanzaIsLocallyInstalled } from '../util.mjs';

const command = new commander.Command()
  .command('build')
  .alias('b')
  .description('build stanzas for deployment')
  .option('-o, --output-path <dir>', 'output directory', './dist')
  .action(async ({outputPath}) => {
    await build(outputPath);
  });

export default command;

async function build(outputPath) {
  const repositoryDir = path.resolve('.');

  ensureTogoStanzaIsLocallyInstalled(repositoryDir);

  const builder    = new broccoli.Builder(composeTree(repositoryDir, {environment: 'production'}));
  const outputTree = new TreeSync(builder.outputPath, outputPath);

  let statusCode;

  await runWatcher(repositoryDir, builder, {
    onBuildSuccess(watcher) {
      statusCode = 0;

      outputTree.sync();
      watcher.quit();
    },

    onBuildFailure(watcher) {
      statusCode = 1;

      watcher.quit();
    }
  });

  process.exit(statusCode);
}
