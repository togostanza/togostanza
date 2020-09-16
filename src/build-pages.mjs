import path from 'path';

import BroccoliPlugin from 'broccoli-plugin';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import styles from 'rollup-plugin-styles';
import virtual from '@rollup/plugin-virtual';
import vue from 'rollup-plugin-vue';
import { rollup } from 'rollup';

import StanzaRepository from './stanza-repository.mjs';
import { handlebarsTemplate, packagePath, resolvePackage } from './util.mjs';

const templates = {
  index: handlebarsTemplate(path.join(packagePath, 'src', 'index.html.hbs')),
  help:  handlebarsTemplate(path.join(packagePath, 'src', 'help.html.hbs'))
};

export default class BuildPages extends BroccoliPlugin {
  constructor(repositoryDir, options) {
    super([repositoryDir], options);

    this.repositoryDir = repositoryDir;
    this.environment   = options.environment;
  }

  async build() {
    const stanzas = new StanzaRepository(this.repositoryDir).allStanzas;

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
        virtual({
          '-repository/all-metadata': `export default ${JSON.stringify(allMetadata)}`
        }),

        alias({
          entries: {
            '-repository/package.json': `${this.repositoryDir}/package.json`
          }
        }),

        replace({
          'process.env.NODE_ENV': JSON.stringify(this.environment),
          __VUE_OPTIONS_API__:    'false',
          __VUE_PROD_DEVTOOLS__:  'false'
        }),

        resolve(),
        commonjs(),
        vue(),
        json(),

        styles({
          sass: {
            impl: resolvePackage('sass')
          }
        })
      ]
    });

    await bundle.write({
      format:    'esm',
      dir:       path.join(this.outputPath, '-togostanza'),
      sourcemap: true
    });
  }

  async buildIndexPage() {
    this.output.writeFileSync('index.html', templates.index());
  }

  async buildHelpPages(stanzas) {
    await Promise.all(stanzas.map(async (stanza) => {
      const metadata = await stanza.metadata;
      const readme   = await stanza.readme;

      this.output.writeFileSync(`${stanza.id}.html`, templates.help({metadata, readme}));
    }));
  }
}
