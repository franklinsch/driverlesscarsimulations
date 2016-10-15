// webpack.config.js
const webpack = require('webpack');
const path = require('path');

var cssloader = "css-loader!postcss-loader";
var sassloader = "style-loader!css-loader!sass-loader!postcss-loader";

let defaultLoaders = [
  {
    test: /\.jsx?$/,
    loader: ['babel-loader'],
    query: {
      cacheDirectory: 'babel_cache',
      presets: ['react', 'es2015']
    }
  },
  {
    test: /\.json$/,
    loader: "json-loader"
  },
  {
    test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: "file-loader"
  }
]

module.exports = {
  standardLoaders: defaultLoaders,
  cssloader: cssloader,
  sassloader: sassloader,
  entry: path.join(__dirname, 'app.js'),
  output: {
    path: path.join(__dirname, 'dev'),
    filename: 'bundle.js'
  },
  module: {
    loaders: defaultLoaders
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new webpack.DefinePlugin({
      '__DEV__': false,
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      mangle: true,
      sourcemap: false,
      beautify: false,
      dead_code: true
    })
  ]
};
