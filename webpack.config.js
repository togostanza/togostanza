const path = require("path");
const fs = require("fs");

const outputPath = path.resolve(__dirname, "dist");
const providerPath = path.resolve(__dirname, "cypress/fixtures/provider");

const stanzas = {};
fs.readdirSync(providerPath, {
  withFileTypes: true,
})
  .filter((dirent) => dirent.isDirectory())
  .forEach((dirent) => {
    stanzas[dirent.name] = path.join(providerPath, dirent.name, "index.js");
  });

module.exports = {
  entry: stanzas,
  output: {
    path: outputPath,
    filename: "[name].js",
  },
  mode: "development",
  module: {
    rules: [{ test: /templates\/.+\.html$/, loader: "handlebars-loader" }],
  },
  devServer: {
    contentBase: outputPath,
  },
  resolve: {
    alias: {
      stanza: path.resolve(__dirname, "stanza.js"),
      provider: providerPath,
    },
  },
};

// TODO generate dist/index.html
// TODO generate stanza-name/index.html (help page)
