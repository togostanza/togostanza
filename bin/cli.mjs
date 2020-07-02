#!/usr/bin/env node

import path from 'path';

import Funnel from 'broccoli-funnel'
import MergeTrees from 'broccoli-merge-trees';
import TreeSync from 'tree-sync';
import UI from 'console-ui';
import broccoli from 'broccoli';
import commandLineArgs from 'command-line-args';
import commandLineCommands from 'command-line-commands';
import messages from 'broccoli/dist/messages.js';
import Generator from 'yeoman-generator';
import yeoman from 'yeoman-environment';

import BuildStanza from '../src/build-stanza.mjs';
import BundleStanzaModules from '../src/bundle-stanza-modules.mjs';
import PreviewServer from '../src/preview-server.mjs';
import { packagePath } from '../src/util.mjs';

const providerDir = path.resolve('.');

const ui = new UI();

const buildTree  = new BuildStanza(providerDir);
const bundleTree = new BundleStanzaModules(buildTree, {providerDir});

const css = new Funnel(packagePath, {
  srcDir: 'src',
  files:  ['app.css'],

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

const {command, argv} = commandLineCommands(['new', 'serve', 'build']);

const optionDefinitions = {
  new: [
  ],
  serve: [
    {name: 'port', type: Number, defaultValue: 8080}
  ],
  build: [
    {name: 'output-path', type: String, defaultValue: './dist'}
  ]
};

const options = commandLineArgs(optionDefinitions[command], {argv});

switch (command) {
  case 'new':
    const env = yeoman.createEnv();
    env.register(path.join(packagePath, 'generators/provider'), 'togostanza:provider');
    env.run('togostanza:provider', err => {
      if (!err) {
        throw err;
      }
    });
    break;
  case 'serve':
    serve(ui, tree, options.port);
    break;
  case 'build':
    build(ui, tree, options['output-path']);
    break;
  default:
    ui.writeLine('togostanza serve|build');
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

async function build(ui, tree, outputPath) {
  const builder    = new broccoli.Builder(tree);
  const outputTree = new TreeSync(builder.outputPath, outputPath);

  await runWatcher(ui, builder, outputPath, (watcher) => {
    outputTree.sync();
    watcher.quit();
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
