import path from 'path';
import { promisify } from 'util';

import BroccoliPlugin from 'broccoli-plugin';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import fs from 'fs-extra';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import outdent from 'outdent';
import sass from 'sass';
import virtual from '@rollup/plugin-virtual';
import { defaultOnWarn } from 'rollup/dist/es/shared/rollup.js';
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

    await Promise.all([
      this.buildStanzas(stanzas),
      this.copyMetadata(stanzas),
      this.copyAssets(stanzas)
    ]);
  }

  async buildStanzas(stanzas) {
    if (stanzas.length === 0) { return; }

    const bundle = await rollup({
      input: stanzas.map(({id}) => `${id}.js`),

      plugins: [
        virtual(
          Object.fromEntries(
            await Promise.all(
              stanzas.map(stanza => virtualModules(stanza, this.repositoryDir))
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

        nodeResolve(),
        commonjs(),
        json(),
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

  async copyMetadata(stanzas) {
    return await Promise.all(
      stanzas.map((stanza) => fs.copy(
        stanza.filepath('metadata.json'),
        path.join(this.outputPath, stanza.id, 'metadata.json')
      ))
    );
  }

  async copyAssets(stanzas) {
    function ignoreMissing(e) {
      if (e.code === 'ENOENT') {
        // do nothing
      } else {
        throw e;
      }
    }

    return await Promise.all([
      fs.copy(
        path.join(this.repositoryDir, 'assets'),
        path.join(this.outputPath, 'assets')
      ).catch(ignoreMissing),

      ...stanzas.map((stanza) => fs.copy(
        stanza.filepath('assets'),
        path.join(this.outputPath, stanza.id, 'assets')
      ).catch(ignoreMissing))
    ]);
  }
}

const entrypointTemplate = handlebarsTemplate('entrypoint.js.hbs', {noEscape: true});

async function virtualModules(stanza, repositoryDir) {
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

  let css;

  try {
    css = (await promisify(sass.render)({
      file: stanza.filepath('stanza.scss'),

      importer(url) {
        return {
          file: url.replace(/^@/, repositoryDir)
        };
      },

      includePaths: [
        path.join(repositoryDir, 'node_modules')
      ]
    })).css.toString();
  } catch (e) {
    css = null;

    console.error(e);
  }

  return [
    [`${stanza.id}.js`,                entrypoint],
    [`-stanza/${stanza.id}/templates`, templates],
    [`-stanza/${stanza.id}/css`,       `export default ${JSON.stringify(css)}`]
  ];
}

function aliasEntries(stanza) {
  return [
    {find: `-stanza/${stanza.id}/main`,     replacement: stanza.filepath('index.js')},
    {find: `-stanza/${stanza.id}/metadata`, replacement: stanza.filepath('metadata.json')}
  ];
}
