const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const outputPath = path.join(__dirname, "dist");
const providerPath = path.resolve('.');

const stanzas = fs
  .readdirSync(providerPath, {
    withFileTypes: true,
  })
  .filter((dirent) => dirent.isDirectory() && !dirent.name.startsWith('.') && dirent.name !== 'node_modules')
  .map(({ name }) => {
    const stanzaDir = path.join(providerPath, name);
    const metadata = require(path.join(stanzaDir, "metadata.json"));
    if (name !== metadata["@id"]) {
      throw new Error(
        `mismatch directory name ${stanzaDir} and its stanza id in metadata.json (${metadata["@id"]})`
      );
    }

    return metadata;
  });

const stanzaEntryPoints = stanzas.map((metadata) => {
  const id = metadata["@id"];
  return {
    entry: { [id]: path.join(providerPath, id, "index.js") },
    output: {
      path: outputPath,
      filename: "[name].js",
    },
    mode: "development",
    module: {
      rules: [
        { test: /templates\/.+\.html$/, use: "handlebars-loader" },
        { test: /\/.+\.hbs$/, use: "handlebars-loader" },
      ],
    },
    resolve: {
      alias: {
        provider: providerPath,
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: `${id}.html`,
        inject: false,
        template: path.join(__dirname, "help.html.hbs"),
        templateParameters: { metadata },
      }),
      new webpack.ProvidePlugin({
        Stanza: path.join(__dirname, "stanza.js"),
        __metadata__: path.join(providerPath, id, "metadata.json"),
      }),
    ],
  };
});

module.exports = [
  ...stanzaEntryPoints,
  {
    entry: "./index.js",
    output: {
      path: outputPath,
    },
    mode: "development",
    module: {
      rules: [{ test: /\/.+\.hbs$/, use: "handlebars-loader" }],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "index.html",
        inject: false,
        template: path.join(__dirname, "index.html.hbs"),
        templateParameters: { stanzas },
      }),
    ],
  },
];

// TODO generate dist/index.html
// TODO generate stanza-name/index.html (help page)
