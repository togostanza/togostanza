import path from 'path';

import BroccoliPlugin from 'broccoli-plugin';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import walkSync from 'walk-sync';
import { defaultOnWarn } from 'rollup/dist/es/shared/rollup.js';
import { rollup } from 'rollup';

import { packagePath } from './util.mjs';

export default class BundleStanzaModules extends BroccoliPlugin {
  constructor(inputNode, options) {
    super([inputNode], options);

    this.moduleDirectory = options.moduleDirectory;
  }

  async build() {
    const distPath = this.inputPaths[0];

    const paths = walkSync(distPath, {
      globs:           ['*.js'],
      includeBasePath: true
    });

    const bundle = await rollup({
      input: paths,

      plugins: [
        alias({
          entries: {
            '~togostanza/stanza':  packagePath('stanza.js'),
            '~handlebars/runtime': packagePath('../node_modules/handlebars/dist/cjs/handlebars.runtime.js')
          }
        }),
        resolve({
          customResolveOptions: {
            moduleDirectory: this.moduleDirectory
          }
        }),
        commonjs()
      ],

      onwarn(warn) {
        // suppress circular dependency warnings
        // ref https://github.com/d3/d3-selection/issues/229
        if (warn.code === 'CIRCULAR_DEPENDENCY') { return; }

        defaultOnWarn(warn);
      }
    });

    await bundle.write({
      format:    'esm',
      dir:       this.outputPath,
      sourcemap: true
    });
  }
}
