/* eslint strict: 0, no-console: 0 */
'use strict';

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const config = require('./webpack.dev.config');
const routes = require('./routes/routes');

const app = express();
const compiler = webpack(config);

const PORT = config.port;

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath,
  inline: true,
  noInfo: true,
  stats: {
    colors: true
  }
}));

app.use(require('webpack-hot-middleware')(compiler));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

app.listen(PORT, 'localhost', err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Listening at http://localhost:${PORT}`);
});
