var path = require('path')
var MpvuePlugin = require('webpack-mpvue-asset-plugin')
var genEntry = require('../lib-changed/mpvue-entry')
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
var CopyWebpackPlugin = require('copy-webpack-plugin')

function resolve (dir) {
  return path.join(process.cwd(), dir)
}
/* changed*/
function resolveCurPath (dir) {
  return path.resolve(__dirname, '..', dir)
}

module.exports = {
  entry: genEntry('./src/pages.js'),
  target: require('mpvue-webpack-target'),
  /* changed*/
  resolveLoader: {
    modules: [path.resolve(__dirname, '../node_modules'), path.resolve(process.cwd(), 'node_modules')]
  },
  /* changed*/
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].js'),
    chunkFilename: utils.assetsPath('js/[id].js'),
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue': 'mpvue',
      '@': resolve('src')
    },
    /* changed*/
    modules: [path.resolve(__dirname, '../node_modules'), path.resolve(process.cwd(), 'node_modules')],
    symlinks: false
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'mpvue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        /* changed*/
        include: [resolve('src'), resolve('test'), resolveCurPath('lib-changed/mpvue-entry')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true,
              extends: path.resolve(__dirname, '../.babelrc')
            }
          },
          {
            loader: 'mpvue-loader',
            options: {
              checkMPEntry: true
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name]].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[ext]')
        }
      }
    ]
  },
  plugins: [
    new MpvuePlugin(),
    /* changed*/
    new CopyWebpackPlugin([
      {
        from: path.resolve(process.cwd(), 'static'),
        to: path.resolve(process.cwd(), 'dist/static'),
        ignore: ['.*']
      }
    ])
  ]
}
