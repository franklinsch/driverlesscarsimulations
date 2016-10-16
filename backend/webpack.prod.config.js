var webpack = require('webpack')
var path = require('path')
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var options = require("./webpack.dev.config");

options.module.loaders = options.standardloaders.concat([
  {
    test: /\.css$/,
    loader: ExtractTextPlugin.extract(options.cssloader)
  },
  {
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract("css-loader!sass-loader!postcss-loader")
  }
]);

options.plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    '__DEV__': false,
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      screw_ie8: true,
      warnings: false
    },
    sourceMap: false
  }),
  new ExtractTextPlugin('style.css', { allChunks: true })
];

options.output.path = path.join(__dirname, 'public');

delete options.output.publicPath;
delete options.debug;
delete options.devtool;

module.exports = options;
