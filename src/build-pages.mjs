import path from 'path';

import * as commonmark from 'commonmark';
import BroccoliPlugin from 'broccoli-plugin';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import handlebars from 'rollup-plugin-handlebars-plus';
import json from 'rollup-plugin-json5';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import styles from 'rollup-plugin-styles';
import virtual from '@rollup/plugin-virtual';
import vue from 'rollup-plugin-vue';
import { rollup } from 'rollup';

import StanzaRepository from './stanza-repository.mjs';
import { handlebarsTemplate, packagePath, resolvePackage } from './util.mjs';

export default class BuildPages extends BroccoliPlugin {
  constructor(repositoryDir, options) {
    super([repositoryDir], options);

    this.repositoryDir = repositoryDir;
    this.environment = options.environment;
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
    const allMetadata = await Promise.all(
      stanzas.map(({ metadata }) => metadata)
    );

    const bundle = await rollup({
      input: [
        path.join(packagePath, 'src', 'index-app.js'),
        path.join(packagePath, 'src', 'help-app.js'),
      ],

      plugins: [
        virtual({
          '-repository/all-metadata': `export default ${JSON.stringify(
            allMetadata
          )}`,
        }),

        alias({
          entries: {
            '-repository/package.json': `${this.repositoryDir}/package.json`,
          },
        }),

        replace({
          'process.env.NODE_ENV': JSON.stringify(this.environment),
          __VUE_OPTIONS_API__: 'false',
          __VUE_PROD_DEVTOOLS__: 'false',
        }),

        resolve(),
        vue({
          compilerOptions: {
            isCustomElement(tagName) {
              return tagName.startsWith('togostanza-');
            },
          },
        }),
        commonjs(),
        json(),

        handlebars({
          handlebars: {
            id: resolvePackage('handlebars/runtime'),
          },
          helpers: [path.join(packagePath, 'src', 'handlebars-helpers.js')],
        }),

        styles({
          sass: {
            impl: resolvePackage('sass'),
          },
        }),
      ],
    });

    await bundle.write({
      format: 'esm',
      dir: path.join(this.outputPath, '-togostanza'),
      sourcemap: true,
    });
  }

  async buildIndexPage() {
    const template = handlebarsTemplate('index.html.hbs');

    this.output.writeFileSync('index.html', template());
  }

  async buildHelpPages(stanzas) {
    const template = handlebarsTemplate('help.html.hbs');

    await Promise.all(
      stanzas.map(async (stanza) => {
        const metadata = await stanza.metadata;
        const readme = await stanza.readme;

        this.output.writeFileSync(
          `${stanza.id}.html`,
          template({
            metadata,
            readme: renderMarkdown(readme),
          })
        );
      })
    );
  }
}

function renderMarkdown(md) {
  if (!md) {
    return '';
  }

  const parser = new commonmark.Parser();
  const renderer = new commonmark.HtmlRenderer();

  return renderer.render(parser.parse(md));
}
