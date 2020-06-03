const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const outputPath = path.resolve(__dirname, "dist");
const providerPath = path.resolve(__dirname, "cypress/fixtures/provider");

const stanzas = fs
  .readdirSync(providerPath, {
    withFileTypes: true,
  })
  .filter((dirent) => dirent.isDirectory())
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
        { test: /templates\/.+\.html$/, loader: "handlebars-loader" },
        { test: /\/.+\.hbs$/, loader: "handlebars-loader" },
      ],
    },
    resolve: {
      alias: {
        stanza: path.resolve(__dirname, "stanza.js"),
        provider: providerPath,
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: `${id}.html`,
        inject: false,
        template: "help.html.hbs",
        templateParameters: { metadata },
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
      rules: [{ test: /\/.+\.hbs$/, loader: "handlebars-loader" }],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "index.html",
        inject: false,
        template: "index.html.hbs",
        templateParameters: { stanzas },
      }),
    ],
  },
];

// TODO generate dist/index.html
// TODO generate stanza-name/index.html (help page)
