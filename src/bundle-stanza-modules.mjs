import path from 'path';

import BroccoliPlugin from 'broccoli-plugin';
import RollupCommonjs from '@rollup/plugin-commonjs';
import RollupResolve from '@rollup/plugin-node-resolve';
import walkSync from 'walk-sync';
import { rollup } from 'rollup';
import { defaultOnWarn } from 'rollup/dist/es/shared/rollup.js';

export default class BundleStanzaModules extends BroccoliPlugin {
  constructor(inputNode, options) {
    super([inputNode], options);

    this.moduleDirectory = options.moduleDirectory;
  }

  async build() {
    const distPath = this.inputPaths[0];

    const paths = walkSync(distPath, {
      globs:           ['*.js'],
      ignore:          ['stanza.js'],
      includeBasePath: true
    });

    await Promise.all(paths.map(async (jsPath) => {
      const bundle = await rollup({
        input: jsPath,

        plugins: [
          RollupResolve({
            customResolveOptions: {
              moduleDirectory: this.moduleDirectory
            }
          }),
          RollupCommonjs()
        ],

        onwarn(warn) {
          // suppress circular dependency warnings
          // ref https://github.com/d3/d3-selection/issues/229
          if (warn.code === 'CIRCULAR_DEPENDENCY') { return; }

          defaultOnWarn(warn);
        }
      });

      const {output} = await bundle.generate({format: 'esm'});

      this.output.writeFileSync(path.basename(jsPath), output[0].code);
    }));
  }
}
