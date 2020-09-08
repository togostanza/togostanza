import path from 'path';

import Funnel from 'broccoli-funnel'
import MergeTrees from 'broccoli-merge-trees';
import UI from 'console-ui';
import broccoli from 'broccoli';
import messages from 'broccoli/dist/messages.js';
import picomatch from 'picomatch';

import BuildStanza from '../build-stanza.mjs';
import BundleStanzaModules from '../bundle-stanza-modules.mjs';
import { packagePath } from '../util.mjs';

export async function runWatcher(repositoryDir, builder, outputPath = null, onBuildSuccess = () => {}) {
  const watchMatcher = picomatch([
    '.',
    'README.md',
    'package.json',
    'stanzas/**',
    'lib/**'
  ].map(_path => path.resolve(repositoryDir, _path)));

  const ui = new UI();

  const watcher = new broccoli.Watcher(builder, builder.watchedSourceNodeWrappers, {
    saneOptions: {
      ignored(_path) {
        const absolutePath = path.resolve(repositoryDir, _path);

        return !watchMatcher(absolutePath);
      }
    }
  });

  watcher.on('buildSuccess', () => {
    messages.default.onBuildSuccess(builder, ui);
    onBuildSuccess(watcher);
  });

  watcher.on('buildFailure', (e) => {
    ui.writeLine('build failure', 'ERROR');
    ui.writeError(e);
  });

  process.on('SIGINT',  () => watcher.quit());
  process.on('SIGTERM', () => watcher.quit());

  try {
    await watcher.start();
  } finally {
    await builder.cleanup();
  }

  process.exit(0); // perhaps LiveServer is still listening and needs to stop the process
}

export function composeTree(repositoryDir, {environment}) {
  const buildTree  = new BuildStanza(repositoryDir, {environment});
  const bundleTree = new BundleStanzaModules(buildTree, {repositoryDir});

  const mergedTree = new MergeTrees([
    buildTree,
    bundleTree
  ], {overwrite: true});

  return new Funnel(mergedTree, {
    exclude: ['*/index.js']
  });
}
