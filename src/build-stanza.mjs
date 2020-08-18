import path from 'path';
import { promises as fs } from 'fs';
import { promisify } from 'util';

import BroccoliPlugin from 'broccoli-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import RSVP from 'rsvp';
import _Handlebars from 'handlebars';
import vueLoader from 'vue-loader/dist/index.js';
import walkSync from 'walk-sync';
import webpack from 'webpack';

import { packagePath, resolvePackage } from './util.mjs';

const Handlebars = _Handlebars.create();

Handlebars.registerHelper('array', function() {
  return Array.from(arguments).slice(0, -1);
});

Handlebars.registerHelper('to-json', function(val) {
  return JSON.stringify(val);
});

Handlebars.registerHelper('eq', function(x, y) {
  return x === y;
});

Handlebars.registerHelper('or', function(x, y) {
  return x || y;
});

async function handlebarsTemplate(fpath, opts = {}) {
  const hbs = await fs.readFile(fpath, 'utf8');

  return Handlebars.compile(hbs, opts);
}

export default class BuildStanza extends BroccoliPlugin {
  constructor(inputNode, options) {
    super([inputNode], options);
  }

  async build() {
    const stanzas = this.allStanzas;

    await Promise.all([
      this.buildIndexApp(stanzas),
      this.buildStanzas(stanzas),
      this.buildHelpApp()
    ]);
  }

  async buildIndexApp(stanzas) {
    const allMetadata = await Promise.all(stanzas.map(({metadata}) => metadata));

    const compiler = webpack({
      mode: 'production',
      entry: path.join(packagePath, 'src', 'index-app.js'),

      output: {
        path:     this.outputPath,
        filename: '-index-app.js',
        library:  'createIndexApp'
      },

      module: {
        rules: [
          {
            test: /\.vue$/,
            use: resolvePackage('vue-loader')
          },
          {
            test: /\.css$/,
            use:  [
              MiniCssExtractPlugin.loader,
              resolvePackage('css-loader')
            ]
          }
        ]
      },

      plugins: [
        new vueLoader.VueLoaderPlugin(),

        new webpack.DefinePlugin({
          allMetadata: JSON.stringify(allMetadata)
        }),

        new HtmlWebpackPlugin({
          filename: 'index.html',
          title:    'List of Stanzas',

          meta: {
            viewport: 'width=device-width, initial-scale=1'
          }
        }),

        new MiniCssExtractPlugin({
          filename: 'index.css'
        })
      ]
    });

    const stats = await promisify(compiler.run.bind(compiler))();

    console.log(stats.toString('errors-warnings'));
  }

  async buildStanzas(stanzas) {
    const templates = await RSVP.hash({
      entrypoint: handlebarsTemplate(path.join(packagePath, 'src', 'entrypoint.js.hbs'), {noEscape: true}),
      help:       handlebarsTemplate(path.join(packagePath, 'src', 'help.html.hbs'))
    });

    await Promise.all(stanzas.map(stanza => this.buildStanza(stanza, templates)));
  }

  async buildStanza(stanza, templates) {
    const metadata = await stanza.metadata;

    this.output.writeFileSync(`${stanza.id}.js`, templates.entrypoint({
      metadata,
      templates: await stanza.templates,
      outer:     await stanza.outer
    }));

    this.output.writeFileSync(`${stanza.id}.html`, templates.help({metadata}));

    this.output.mkdirSync(stanza.id);
    await fs.copyFile(stanza.scriptPath, path.join(this.outputPath, stanza.id, 'index.js'));
  }

  async buildHelpApp() {
    const compiler = webpack({
      mode: 'production',
      entry: path.join(packagePath, 'src', 'help-app.js'),

      output: {
        path:     this.outputPath,
        filename: '-help-app.js',
        library:  'createHelpApp'
      },

      module: {
        rules: [
          {
            test: /\.vue$/,
            use: resolvePackage('vue-loader')
          },
          {
            test: /\.css$/,
            use:  [
              MiniCssExtractPlugin.loader,
              resolvePackage('css-loader')
            ]
          }
        ]
      },

      plugins: [
        new vueLoader.VueLoaderPlugin(),

        new MiniCssExtractPlugin({
          filename: 'help.css'
        })
      ]
    });

    const stats = await promisify(compiler.run.bind(compiler))();

    console.log(stats.toString('errors-warnings'));
  }

  get allStanzas() {
    const repositoryDir = this.inputPaths[0];

    return walkSync(repositoryDir, {
      globs:           ['stanzas/*/metadata.json'],
      includeBasePath: true
    }).map((metadataPath) => {
      const stanzaDir = path.dirname(metadataPath);

      return {
        id:         path.basename(stanzaDir),
        scriptPath: path.join(stanzaDir, 'index.js'),

        get metadata() {
          return fs.readFile(metadataPath).then(JSON.parse);
        },

        get templates() {
          const paths = walkSync(stanzaDir, {
            globs:           ['templates/*'],
            includeBasePath: true
          });

          return Promise.all(paths.map(async (templatePath) => {
            const name = path.basename(templatePath, '.hbs');

            return {
              name,

              spec: Handlebars.precompile(await fs.readFile(templatePath, 'utf8'), {
                noEscape: path.extname(name) !== '.html'
              })
            };
          }));
        },

        get outer() {
          return fs.readFile(path.join(stanzaDir, '_header.html'), 'utf8').catch(() => null);
        }
      };
    });
  }
}
