import fs from 'fs';
import path from 'path';

import Funnel from 'broccoli-funnel'
import MergeTrees from 'broccoli-merge-trees';
import UI from 'console-ui';
import broccoli from 'broccoli';
import debounce from 'lodash.debounce';
import messages from 'broccoli/dist/messages.js';
import picomatch from 'picomatch';
import sane from 'sane';

import BuildStanza from '../build-stanza.mjs';
import BundleStanzaModules from '../bundle-stanza-modules.mjs';
import { packagePath } from '../util.mjs';

export async function runWatcher(repositoryDir, builder, onBuildSuccess = () => {}) {
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

  watchPackageFiles(repositoryDir, builder);

  try {
    await watcher.start();
  } finally {
    await builder.cleanup();
  }

  process.exit(0); // perhaps LiveServer is still listening and needs to stop the process
}

import resolve from 'resolve';

function watchPackageFiles(repositoryDir, builder) {
  const packageJsonPath = resolve.sync('togostanza/package.json', {basedir: repositoryDir});
  const installedPath   = path.resolve(packageJsonPath, '..');

  if (!fs.lstatSync(installedPath).isSymbolicLink()) { return; }

  const watcher = sane(fs.realpathSync(installedPath), {glob: ['**/*']});
  const ui = new UI();

  const handler = debounce(async () => {
    try {
      await builder.build();
      messages.default.onBuildSuccess(builder, ui);
    } catch (e) {
      ui.writeLine('build failure', 'ERROR');
      ui.writeError(e);
    }
  }, 100);

  watcher.on('add',    handler);
  watcher.on('delete', handler);
  watcher.on('change', handler);
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
