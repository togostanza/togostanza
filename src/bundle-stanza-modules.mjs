import path from 'path';

import BroccoliPlugin from 'broccoli-plugin';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import resolveModule from 'resolve';
import walkSync from 'walk-sync';
import { defaultOnWarn } from 'rollup/dist/es/shared/rollup.js';
import { rollup } from 'rollup';

import { packagePath } from './util.mjs';

export default class BundleStanzaModules extends BroccoliPlugin {
  constructor(inputNode, options) {
    super([inputNode], options);

    this.repositoryDir = options.repositoryDir;
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
          entries: [
            {
              find: /^@\/stanzas\/([^/]+)$/,
              replacement: './$1.js'
            },
            {
              find: '@',
              replacement: this.repositoryDir
            },
            {
              find: '-togostanza/stanza-element',
              replacement: path.join(packagePath, 'src', 'stanza-element.mjs')
            },
            {
              find: '-system/handlebars/runtime',
              replacement: resolveModule.sync('handlebars/runtime', {basedir: packagePath})
            },
            {
              find: '-system/lodash.debounce',
              replacement: resolveModule.sync('lodash.debounce', {basedir: packagePath})
            }
          ]
        }),
        resolve({
          customResolveOptions: {
            basedir: this.repositoryDir
          }
        }),
        commonjs()
      ],

      external(id) {
        return /^https?:\/\//.test(id)
      },

      onwarn(warn) {
        // suppress circular dependency warnings
        // ref https://github.com/d3/d3-selection/issues/229
        if (warn.code === 'CIRCULAR_DEPENDENCY') { return; }

        defaultOnWarn(warn);
      }
    });

    const basename = path.basename(this.repositoryDir);

    await bundle.write({
      format:    'esm',
      dir:       this.outputPath,
      sourcemap: true,

      sourcemapPathTransform: (relativeSourcePath) => {
        const fullPath = path.resolve(inputPath, relativeSourcePath);

        if (fullPath.startsWith(inputPath)) {
          return `${basename}/${fullPath.slice(inputPath.length + 1)}`;
        }

        if (fullPath.startsWith(this.repositoryDir)) {
          return `${basename}/${fullPath.slice(this.repositoryDir.length + 1)}`;
        }

        if (fullPath.startsWith(packagePath)) {
          return `togostanza/${fullPath.slice(packagePath.length + 1)}`;
        }

        return fullPath;
      }
    });
  }
}
