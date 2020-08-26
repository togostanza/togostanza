import MergeTrees from 'broccoli-merge-trees';
import UI from 'console-ui';
import broccoli from 'broccoli';
import commander from 'commander';

import PreviewServer from '../preview-server.mjs';
import { composeTree, runWatcher } from './-build-internal.mjs';

const command = new commander.Command()
  .storeOptionsAsProperties(false)
  .passCommandToAction(false)
  .command('serve')
  .alias('s')
  .description('serve the repository locally')
  .option('-p, --port <port>', 'server port', (v) => Number(v), 8080)
  .action(async ({port}) => {
    await serve(port);
  });

export default command;

async function serve(port) {
  const ui   = new UI();
  const tree = composeTree('.');

  const server = new MergeTrees([
    tree,

    new PreviewServer(tree, (server) => {
      server.listen(port);
    })
  ]);

  const builder = new broccoli.Builder(server);

  ui.writeInfoLine(`Serving at http://localhost:${port}`);

  await runWatcher(builder);
}
