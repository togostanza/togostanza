import path from 'path';

import MergeTrees from 'broccoli-merge-trees';
import UI from 'console-ui';
import broccoli from 'broccoli';
import commander from 'commander';
import resolve from 'resolve';

import PreviewServer from '../preview-server.mjs';
import { composeTree, runWatcher } from './-build-internal.mjs';
import { ensureTogoStanzaIsLocallyInstalled } from '../util.mjs';

const command = new commander.Command()
  .command('serve')
  .alias('s')
  .description('serve the repository locally')
  .option('-p, --port <port>', 'server port', (v) => Number(v), 8080)
  .action(async ({port}) => {
    await serve(port);
  });

export default command;

async function serve(port) {
  const repositoryDir = path.resolve('.');

  ensureTogoStanzaIsLocallyInstalled(repositoryDir);

  const ui   = new UI();
  const tree = composeTree(repositoryDir, {environment: 'development'});

  const server = new MergeTrees([
    tree,

    new PreviewServer(tree, (server) => {
      server.listen(port);
    })
  ]);

  const builder = new broccoli.Builder(server);

  ui.writeInfoLine(`Serving at http://localhost:${port}`);

  await runWatcher(repositoryDir, builder, {
    onReady(watcher) {
      process.on('SIGINT',  () => watcher.quit());
      process.on('SIGTERM', () => watcher.quit());
    }
  });

  process.exit(0); // force terminate as we may have pending promises
}
