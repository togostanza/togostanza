#!/usr/bin/env node

import webpack from 'webpack';
import middleware from 'webpack-dev-middleware';
import express from 'express';

import config from './webpack.config.js';

const app = express();
const compiler = webpack(config);

app.use(middleware(compiler));

app.listen(8080, () => {
  console.log('listening on port 8080');
});
