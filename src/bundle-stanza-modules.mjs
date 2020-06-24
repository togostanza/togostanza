import path from 'path';

import BroccoliPlugin from 'broccoli-plugin';
import RollupCommonjs from '@rollup/plugin-commonjs';
import RollupResolve from '@rollup/plugin-node-resolve';
import walkSync from 'walk-sync';
import { rollup } from 'rollup';

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
        ]
      });

      const {output} = await bundle.generate({format: 'esm'});

      this.output.writeFileSync(path.basename(jsPath), output[0].code);
    }));
  }
}
