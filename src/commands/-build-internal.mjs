import fs from 'fs';
import path from 'path';

import MergeTrees from 'broccoli-merge-trees';
import UI from 'console-ui';
import broccoli from 'broccoli';
import debounce from 'lodash.debounce';
import messages from 'broccoli/dist/messages.js';
import picomatch from 'picomatch';
import sane from 'sane';

import BuildPages from '../build-pages.mjs';
import BuildStanzas from '../build-stanzas.mjs';
import { lookupInstalledPath } from '../util.mjs';

export async function runWatcher(repositoryDir, builder, {onReady, onBuildSuccess, onBuildFailure} = {}) {
  const watchMatcher = picomatch([
    '.',
    'README.md',
    'package.json',
    'stanzas/**',
    'lib/**',
    'assets/**'
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

    if (onBuildSuccess) {
      onBuildSuccess(watcher);
    };
  });

  watcher.on('buildFailure', (e) => {
    ui.writeLine('build failure', 'ERROR');
    ui.writeError(e);

    if (onBuildFailure) {
      onBuildFailure(watcher);
    }
  });

  watchPackageFilesInDevelopment(repositoryDir, builder);

  if (onReady) {
    onReady(watcher);
  }

  try {
    await watcher.start();
  } finally {
    await builder.cleanup();
  }
}

function watchPackageFilesInDevelopment(repositoryDir, builder) {
  const installedPath = lookupInstalledPath(repositoryDir);

  // togostanza is not installed. return here to prevent error duplication
  if (!installedPath) { return; }

  // not in development (not npm link-ed)
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
  const stanzas = new BuildStanzas(repositoryDir);
  const pages   = new BuildPages(repositoryDir, {environment});

  return new MergeTrees([
    stanzas,
    pages
  ]);
}
