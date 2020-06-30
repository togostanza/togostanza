#!/usr/bin/env node

import path from 'path';

import Funnel from 'broccoli-funnel'
import MergeTrees from 'broccoli-merge-trees';
import TreeSync from 'tree-sync';
import UI from 'console-ui';
import broccoli from 'broccoli';
import messages from 'broccoli/dist/messages.js';

import BuildStanza from './build-stanza.mjs';
import BundleStanzaModules from './bundle-stanza-modules.mjs';
import PreviewServer from './preview-server.mjs';
import { packagePath } from './util.mjs';

const providerDir = path.resolve('.');

const ui = new UI();

const buildTree  = new BuildStanza(providerDir);
const bundleTree = new BundleStanzaModules(buildTree, {providerDir});

const css = new Funnel(packagePath('.'), {
  files: ['app.css'],

  getDestinationPath(fpath) {
    if (fpath === 'app.css') { return 'togostanza.css'; }

    return fpath;
  }
});

const tree = new MergeTrees([
  buildTree,
  bundleTree,
  css
], {overwrite: true});

switch (process.argv[2]) {
  case undefined:
  case 'serve':
    serve(ui, tree, 8080);
    break;
  case 'build':
    build(ui, tree, 'dist', {watch: false});
    break;
  case 'watch':
    build(ui, tree, 'dist', {watch: true});
    break;
  default:
    ui.writeLine('togostanza serve|build|watch');
    process.exit(1);
}

async function serve(ui, tree, port) {
  const server = new MergeTrees([
    tree,

    new PreviewServer(tree, (server) => {
      server.listen(port);
    })
  ]);

  const builder = new broccoli.Builder(server);

  ui.writeInfoLine(`Serving at http://localhost:${port}`);

  await runWatcher(ui, builder);
}

async function build(ui, tree, outputPath, {watch}) {
  const builder    = new broccoli.Builder(tree);
  const outputTree = new TreeSync(builder.outputPath, outputPath);

  await runWatcher(ui, builder, outputPath, (watcher) => {
    outputTree.sync();

    if (!watch) {
      watcher.quit();
    }
  });
}

async function runWatcher(ui, builder, outputPath, onBuildSuccess = () => {}) {
  const watcher = new broccoli.Watcher(builder, builder.watchedSourceNodeWrappers, {
    saneOptions: {
      ignored: `${outputPath}/**`
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
