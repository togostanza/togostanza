const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
  const stanzaId   = metadata["@id"];
  const stanzaRoot = path.join(providerPath, stanzaId);

  const provideMappings = {
    Stanza:       path.join(__dirname, "stanza.js"),
    __metadata__: path.join(stanzaRoot, "metadata.json"),
  };

  const outerPath = path.join(stanzaRoot, "_header.html");

  if (fs.existsSync(outerPath)) {
    provideMappings.__outer__ = outerPath;
  }

  return {
    entry: {
      [stanzaId]: path.join(stanzaRoot, "index.js")
    },
    output: {
      path: outputPath,
      filename: "[name].js",
    },
    mode: "development",
    module: {
      rules: [
        { test: /\/.+\.(hbs|html)$/, use: require.resolve("handlebars-loader") },
      ],
    },
    resolve: {
      alias: {
        provider: providerPath,
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: `${stanzaId}.html`,
        inject: false,
        template: path.join(__dirname, "help.html.hbs"),
        templateParameters: { metadata },
      }),
      new webpack.ProvidePlugin(provideMappings)
    ],
  };
});

module.exports = [
  ...stanzaEntryPoints,
  {
    entry: path.join(__dirname, "index.js"),
    output: {
      path: outputPath,
    },
    mode: "development",
    module: {
      rules: [
        { test: /\.hbs$/, use: require.resolve("handlebars-loader") },
        { test: /\.css$/, use: [
          MiniCssExtractPlugin.loader,
          require.resolve("css-loader")
        ]}
      ],
    },
    plugins: [
      new MiniCssExtractPlugin(),
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: path.join(__dirname, "index.html.hbs"),
        templateParameters: { stanzas },
      }),
    ],
  },
];

// TODO generate dist/index.html
// TODO generate stanza-name/index.html (help page)
