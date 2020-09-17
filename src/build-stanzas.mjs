import path from 'path';

import BroccoliPlugin from 'broccoli-plugin';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import outdent from 'outdent';
import resolve from '@rollup/plugin-node-resolve';
import virtual from '@rollup/plugin-virtual';
import { rollup } from 'rollup';

import StanzaRepository from './stanza-repository.mjs';
import { handlebarsTemplate, packagePath } from './util.mjs';

export default class BuildStanzas extends BroccoliPlugin {
  constructor(repositoryDir, options) {
    super([repositoryDir], options);

    this.repositoryDir = repositoryDir;
  }

  async build() {
    const stanzas = new StanzaRepository(this.repositoryDir).allStanzas;

    await this.buildStanzas(stanzas);
  }

  async buildStanzas(stanzas) {
    const bundle = await rollup({
      input: stanzas.map(({id}) => `${id}.js`),

      plugins: [
        virtual(
          Object.fromEntries(
            await Promise.all(
              stanzas.map(virtualModules)
            ).then(ary => ary.flat(1))
          )
        ),

        alias({
          entries: [
            {find: '-togostanza/stanza-element', replacement: path.join(packagePath, 'src', 'stanza-element.mjs')},
            {find: /^@\/stanzas\/([^/]+)$/,      replacement: '$1.js'},
            {find: '@',                          replacement: this.repositoryDir},

            ...stanzas.flatMap(aliasEntries)
          ]
        }),

        resolve(),
        commonjs(),
        json()
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

    await bundle.write({
      format:    'esm',
      dir:       this.outputPath,
      sourcemap: true,

      entryFileNames({facadeModuleId}) {
        return facadeModuleId.replace(/^\x00virtual:/, '');
      },
    });
  }
}

const entrypointTemplate = handlebarsTemplate(path.join(packagePath, 'src', 'entrypoint.js.hbs'), {noEscape: true});

async function virtualModules(stanza) {
  const entrypoint = entrypointTemplate({
    stanzaId: stanza.id,
  });

  const templates = outdent`
    export default [
      ${(await stanza.templates).map(({name, spec}) => {
        return `[${JSON.stringify(name)}, ${spec}]`
      }).join(',\n')}
    ];
  `;

  return [
    [`${stanza.id}.js`,                entrypoint],
    [`-stanza/${stanza.id}/templates`, templates]
  ];
}

function aliasEntries(stanza) {
  return [
    {find: `-stanza/${stanza.id}/main`,     replacement: stanza.filepath('index.js')},
    {find: `-stanza/${stanza.id}/metadata`, replacement: stanza.filepath('metadata.json')}
  ];
}
