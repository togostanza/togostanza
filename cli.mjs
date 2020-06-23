#!/usr/bin/env node

import LiveServer from 'broccoli-live-server';
import TreeSync from 'tree-sync';
import UI from 'console-ui';
import broccoli from 'broccoli';
import messages from 'broccoli/dist/messages.js';

import BuildStanza from './build-stanza.mjs';

const tree = new BuildStanza('.');
const ui   = new UI();

switch (process.argv[2]) {
  case undefined:
  case 'serve':
    build(tree, ui, {watch: true, serve: true});
    break;
  case 'build':
    build(tree, ui, {watch: false, serve: false});
    break;
  case 'watch':
    build(tree, ui, {watch: true, serve: false});
    break;
  default:
    ui.writeLine('togostanza serve|build|watch');
    process.exit(1);
}

async function build(tree, ui, {watch, serve}) {
  if (serve) {
    tree = new LiveServer(tree, {
      port:     8080,
      logLevel: 0
    });

    ui.writeInfoLine('Serving at http://localhost:8080');
  }

  const builder    = new broccoli.Builder(tree);
  const outputTree = new TreeSync(builder.outputPath, 'dist');

  const watcher = new broccoli.Watcher(builder, builder.watchedSourceNodeWrappers, {
    saneOptions: {
      ignored: 'dist/**'
    }
  });

  watcher.on('buildSuccess', () => {
    outputTree.sync();
    messages.default.onBuildSuccess(builder, ui);

    if (!watch) {
      watcher.quit();
    }
  });

  watcher.on('buildFailure', (e) => {
    ui.writeLine('build failure', 'ERROR');
    ui.writeError(e);
  });

  process.on('SIGINT',  () => watcher.quit());
  process.on('SIGTERM', () => watcher.quit());

  try {
    await watcher.start()
  } catch (e) {
    ui.writeError(e);
  } finally {
    try {
      builder.cleanup();
      process.exit(0);
    } catch (e) {
      ui.writeLine('cleanup error', 'ERROR');
      ui.writeError(e);
      process.exit(1);
    }
  }
}
