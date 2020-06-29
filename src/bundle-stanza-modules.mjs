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
    const inputPath = this.inputPaths[0];

    const paths = walkSync(inputPath, {
      globs:           ['*.js'],
      includeBasePath: true
    });

    const bundle = await rollup({
      input: paths,

      plugins: [
        alias({
          entries: {
            '~togostanza/stanza-element': packagePath('stanza-element.mjs'),
            '~handlebars/runtime':        packagePath('../node_modules/handlebars/lib/handlebars.runtime.js'),
            '~lodash.debounce':           packagePath('../node_modules/lodash.debounce/index.js')
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

    // TODO get the exact name
    const basename = path.basename(path.resolve(this.moduleDirectory, '..'));

    await bundle.write({
      format:    'esm',
      dir:       this.outputPath,
      sourcemap: true,

      sourcemapPathTransform: (relativeSourcePath) => {
        const fullPath = path.resolve(inputPath, relativeSourcePath);

        if (fullPath.startsWith(inputPath)) {
          return `${basename}/${fullPath.slice(inputPath.length + 1)}`;
        }

        if (fullPath.startsWith(this.moduleDirectory)) {
          return `${basename}/node_modules/${fullPath.slice(this.moduleDirectory.length + 1)}`;
        }

        const packageRoot = packagePath('..').replace(/\/$/, '');

        if (fullPath.startsWith(packageRoot)) {
          return `togostanza/${fullPath.slice(packageRoot.length + 1)}`;
        }

        return fullPath;
      }
    });
  }
}
