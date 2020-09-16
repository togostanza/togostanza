import path from 'path';

import BroccoliPlugin from 'broccoli-plugin';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import scss from 'rollup-plugin-scss';
import vue from 'rollup-plugin-vue';
import { rollup } from 'rollup';

import StanzaRepository from './stanza-repository.mjs';
import { handlebarsTemplate, packagePath } from './util.mjs';

export default class BuildPages extends BroccoliPlugin {
  constructor(inputNode, options) {
    super([inputNode], options);

    this.environment = options.environment;
  }

  async build() {
    const stanzas = new StanzaRepository(this.inputPaths[0]).allStanzas;

    await Promise.all([
      this.buildVueApps(stanzas),
      this.buildIndexPage(),
      this.buildHelpPages(stanzas),
    ]);
  }

  async buildVueApps(stanzas) {
    const allMetadata = await Promise.all(stanzas.map(({metadata}) => metadata));

    const bundle = await rollup({
      input: [
        path.join(packagePath, 'src', 'index-app.js'),
        path.join(packagePath, 'src', 'help-app.js')
      ],

      plugins: [
        alias({
          entries: {
            'package.json': this.inputPaths[0] + '/package.json'
          }
        }),
        resolve({
          customResolveOptions: {
            basedir: this.inputPaths[0]
          }
        }),
        commonjs(),
        vue(),
        scss({
          output: path.join(this.outputPath, '-togostanza', 'app.css')
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify(this.environment),
          __VUE_OPTIONS_API__:    'false',
          __VUE_PROD_DEVTOOLS__:  'false',
          ALL_METADATA:           JSON.stringify(allMetadata),
        }),
        json()
      ]
    });

    await bundle.write({
      format:    'esm',
      dir:       path.join(this.outputPath, '-togostanza'),
      sourcemap: true
    });
  }

  async buildIndexPage() {
    const template = await handlebarsTemplate(path.join(packagePath, 'src', 'index.html.hbs'));

    this.output.writeFileSync('index.html', template());
  }

  async buildHelpPages(stanzas) {
    const template = await handlebarsTemplate(path.join(packagePath, 'src', 'help.html.hbs'));

    await Promise.all(stanzas.map(async (stanza) => {
      const metadata = await stanza.metadata;
      const readme   = await stanza.readme;

      this.output.writeFileSync(`${stanza.id}.html`, template({metadata, readme}));
    }));
  }
}
