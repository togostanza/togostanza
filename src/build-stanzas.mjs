import path from 'path';

import BroccoliPlugin from 'broccoli-plugin';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import fs from 'fs-extra';
import json from 'rollup-plugin-json5';
import nodeResolve from '@rollup/plugin-node-resolve';
import outdent from 'outdent';
import * as sass from 'sass';
import url from '@rollup/plugin-url';
import virtual from '@rollup/plugin-virtual';
import { rollup } from 'rollup';
import replace from '@rollup/plugin-replace';
import JSON5 from 'json5';
import typescript from 'rollup-plugin-typescript2';
import StanzaRepository from './stanza-repository.mjs';
import { handlebarsTemplate, packagePath } from './util.mjs';

export default class BuildStanzas extends BroccoliPlugin {
  constructor(repositoryDir, options) {
    super([repositoryDir], options);

    this.repositoryDir = repositoryDir;
    this.environment = options.environment;
  }

  async build() {
    const stanzas = new StanzaRepository(this.repositoryDir).allStanzas;

    await this.buildMetadata(stanzas);
    await Promise.all([this.buildStanzas(stanzas), this.copyAssets(stanzas)]);
  }

  async buildStanzas(stanzas) {
    if (stanzas.length === 0) {
      return;
    }

    for (const stanza of stanzas) {
      try {
        const sourcePath = stanza.filepath('style.scss');
        const destPath = path.join(this.outputPath, `${stanza.id}.css`);

        if (!fs.existsSync(sourcePath)) {
          fs.writeFileSync(destPath, '');
          continue;
        }

        const { repositoryDir } = this;

        const css = sass
          .renderSync({
            file: sourcePath,

            importer(url) {
              return {
                file: url.replace(/^@/, repositoryDir),
              };
            },

            includePaths: [path.join(repositoryDir, 'node_modules')],
          })
          .css.toString();

        fs.writeFileSync(destPath, css);
      } catch (e) {
        console.error(e);
      }
    }

    const buildConfig = await readBuildConfig(
      this.repositoryDir,
      this.environment
    );
    const customRollupPlugins = buildConfig?.rollup?.plugins || [];

    const tsconfig = await readTsconfig(this.repositoryDir);
    const typescriptPlugins = [];
    if (tsconfig) {
      console.log('tsconfig.json found; TypeScript support enabled');
      typescriptPlugins.push(typescript(tsconfig?.compileOptions));
    }

    const bundle = await rollup({
      input: stanzas.map(({ id }) => `${id}.js`),

      plugins: [
        virtual(
          Object.fromEntries(
            await Promise.all(
              stanzas.map((stanza) =>
                virtualModules(stanza, this.repositoryDir)
              )
            ).then((ary) => ary.flat(1))
          )
        ),

        alias({
          entries: [
            {
              find: '-togostanza/stanza-element',
              replacement: path.join(packagePath, 'src', 'stanza-element.mjs'),
            },
            { find: /^@\/stanzas\/([^/]+)$/, replacement: '$1.js' },
            { find: '@', replacement: this.repositoryDir },

            ...stanzas.flatMap((e) => aliasEntries(e, this.outputPath)),
          ],
        }),

        replace({
          values: {
            'process.env.NODE_ENV': JSON.stringify(this.environment),
          },
          preventAssignment: true,
        }),

        ...typescriptPlugins,

        ...customRollupPlugins,

        nodeResolve({ browser: true }),
        commonjs(),
        json(),

        url({
          limit: Infinity,
        }),
      ],

      external(id) {
        return /^https?:\/\//.test(id);
      },

      onwarn(warn) {
        // suppress circular dependency warnings
        // https://github.com/d3/d3-selection/issues/229
        if (warn.code === 'CIRCULAR_DEPENDENCY') {
          return;
        }

        // suppress 'this' keyword is equivalent to 'undefined' warnings
        // https://github.com/rollup/rollup/issues/1518
        if (warn.code === 'THIS_IS_UNDEFINED') {
          return;
        }

        console.warn(warn.message || warn);
      },
    });

    await bundle.write({
      format: 'esm',
      dir: this.outputPath,
      sourcemap: true,

      entryFileNames({ facadeModuleId }) {
        return facadeModuleId.replace(/^\x00virtual:/, '');
      },
    });
  }

  async buildMetadata(stanzas) {
    for await (const stanza of stanzas) {
      const metadata = await stanza.metadata();

      await fs.mkdirp(path.join(this.outputPath, stanza.id));
      await fs.writeFile(
        path.join(this.outputPath, stanza.id, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );
    }
  }

  async copyAssets(stanzas) {
    function filter(src, dest) {
      return path.basename(src) !== '.keep';
    }

    function ignoreMissing(e) {
      if (e.code === 'ENOENT') {
        // do nothing
      } else {
        throw e;
      }
    }

    return await Promise.all([
      fs
        .copy(
          path.join(this.repositoryDir, 'assets'),
          path.join(this.outputPath, 'assets'),
          { filter }
        )
        .catch(ignoreMissing),

      ...stanzas.map((stanza) =>
        fs
          .copy(
            stanza.filepath('assets'),
            path.join(this.outputPath, stanza.id, 'assets'),
            { filter }
          )
          .catch(ignoreMissing)
      ),
    ]);
  }
}

const entrypointTemplate = handlebarsTemplate('entrypoint.js.hbs', {
  noEscape: true,
});

async function virtualModules(stanza, repositoryDir) {
  const entrypoint = entrypointTemplate({
    stanzaId: stanza.id,
  });

  const templates = outdent`
    export default [
      ${(await stanza.templates)
        .map(({ name, spec }) => {
          return `[${JSON.stringify(name)}, ${spec}]`;
        })
        .join(',\n')}
    ];
  `;

  return [
    [`${stanza.id}.js`, entrypoint],
    [`-stanza/${stanza.id}/templates`, templates],
  ];
}

function aliasEntries(stanza, outputPath) {
  return [
    {
      find: `-stanza/${stanza.id}/js`,
      replacement: stanza.stanzaEntryPointPath(),
    },
    {
      find: `-stanza/${stanza.id}/metadata`,
      replacement: path.join(outputPath, stanza.id, 'metadata.json'),
    },
  ];
}

async function readBuildConfig(repositoryDir, environment) {
  try {
    const { default: initConfig } = await import(
      path.join(repositoryDir, 'togostanza-build.mjs')
    );

    return initConfig(environment);
  } catch (e) {
    if (e.code === 'ERR_MODULE_NOT_FOUND') {
      return null;
    } else {
      throw e;
    }
  }
}

async function readTsconfig(repositoryDir) {
  try {
    const tsconfig = await fs.readFileSync(
      path.join(repositoryDir, 'tsconfig.json')
    );
    return JSON5.parse(tsconfig);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return null;
    } else {
      throw e;
    }
  }
}
