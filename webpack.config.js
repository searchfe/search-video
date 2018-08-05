const path = require('path');

module.exports = {
  entry: {
    'search-video': './src/index.js'
  },
  output: {
    filename: '[name].v1.min.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};