import MergeTrees from 'broccoli-merge-trees';
import UI from 'console-ui';
import broccoli from 'broccoli';

import PreviewServer from '../preview-server.mjs';
import { composeTree, runWatcher } from './-build-internal.mjs';

export default async function serve(_argv, {port}) {
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

export const optionDefinition = [
  {name: 'port', type: Number, defaultValue: 8080}
];
