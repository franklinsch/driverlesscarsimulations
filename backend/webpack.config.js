// webpack.config.js
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: [
    // Set up an ES6-ish environment
    'babel-polyfill',

    // Add your application's scripts below
    path.join(__dirname, 'client.js')
  ],
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: path.join(__dirname),
      loader: ['babel-loader'],
      exclude: [
        path.resolve(__dirname, "node_modules"),
      ],
      query: {
        plugins: ['transform-runtime'],
        cacheDirectory: 'babel_cache',
        presets: ['es2015', 'stage-0', 'react']
      },
      progress: true
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      mangle: true,
      sourcemap: false,
      beautify: false,
      dead_code: true
    })
  ]
};
