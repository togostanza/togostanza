#!/usr/bin/env node

import LiveServer from 'broccoli-live-server';
import MergeTrees from 'broccoli-merge-trees';
import TreeSync from 'tree-sync';
import UI from 'console-ui';
import broccoli from 'broccoli';
import messages from 'broccoli/dist/messages.js';

import BuildStanza from './build-stanza.mjs';

const ui   = new UI();
const tree = new BuildStanza('.');

switch (process.argv[2]) {
  case undefined:
  case 'serve':
    serve(ui, tree, 8080);
    break;
  case 'build':
    build(ui, tree, 'dist');
    break;
  case 'watch':
    watch(ui, tree, 'dist');
    break;
  default:
    ui.writeLine('togostanza serve|build|watch');
    process.exit(1);
}

async function serve(ui, tree, port) {
  const server = new MergeTrees([
    tree,

    new LiveServer(tree, {
      port,
      logLevel: 0
    })
  ]);

  const builder = new broccoli.Builder(server);

  ui.writeInfoLine(`Serving at http://localhost:${port}`);

  await runWatcher(ui, builder);
}

async function build(ui, tree, distPath) {
  const builder    = new broccoli.Builder(tree);
  const outputTree = new TreeSync(builder.outputPath, distPath);

  try {
    await builder.build();

    messages.default.onBuildSuccess(builder, ui);
    outputTree.sync();
  } finally {
    await builder.cleanup();
  }
}

async function watch(ui, tree, distPath) {
  const builder    = new broccoli.Builder(tree);
  const outputTree = new TreeSync(builder.outputPath, distPath);

  await runWatcher(ui, builder, () => {
    outputTree.sync();
  });
}

async function runWatcher(ui, builder, onBuildSuccess = () => {}) {
  const watcher = new broccoli.Watcher(builder, builder.watchedSourceNodeWrappers, {
    saneOptions: {
      ignored: 'dist/**'
    }
  });

  watcher.on('buildSuccess', () => {
    messages.default.onBuildSuccess(builder, ui);
    onBuildSuccess();
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
