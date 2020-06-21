#!/usr/bin/env node

import LiveServer from 'broccoli-live-server';
import TreeSync from 'tree-sync';
import UI from 'console-ui';
import broccoli from 'broccoli';
import messages from 'broccoli/dist/messages.js';

import brocfile from './Brocfile.mjs';

const command = process.argv[2] || 'serve';

let inputNode = brocfile();

if (command === 'serve') {
  inputNode = new LiveServer(inputNode, {
    port:     8080,
    logLevel: 0
  });
}

const ui      = new UI();
const builder = new broccoli.Builder(inputNode);

const watcher = new broccoli.Watcher(builder, builder.watchedSourceNodeWrappers, {
  saneOptions: {
    ignored: 'dist/**'
  }
});

switch (command) {
  case 'serve':
    ui.writeLine('Serving at http://localhost:8080');
    build(builder, watcher, ui, {watch: true});
    break;
  case 'watch':
    build(builder, watcher, ui, {watch: true});
    break;
  case 'build':
    build(builder, watcher, ui, {watch: false});
    break;
  default:
    ui.writeLine('togostanza serve|build|watch');
}

async function build(builder, watcher, ui, {watch}) {
  const outputTree = new TreeSync(builder.outputPath, 'dist');

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
