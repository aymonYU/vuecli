const utils = require('./utils')
const path = require('path')
const vueLoaderConfig = require('./vue-loader.conf')
const MpvuePlugin = require('webpack-mpvue-asset-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = function (configChain, isDev) {
  // configChain.set('target', require('../mpvue-webpack-target'))

  configChain.output
    .path(path.resolve(process.cwd(), 'dist'))
    .filename('[name].js')
    .publicPath('/')

  configChain.resolve.alias.set('vue', 'mpvue')

  const cssM = utils.styleLoaders({
    sourceMap: process.env.NODE_ENV === 'production',
    extract: true
  })

  cssM.forEach(item => {
    const name = item.name

    const rule = configChain.module.rule(name).test(item.test)

    item.use.forEach(u => {
      rule
        .use(u.loader)
        .loader(u.loader)
        .options(u.options)
    })
  })

  configChain.module
    .rule('vue')
    .test(/\.vue$/)
    .use('mpvue-loader')
    .loader('mpvue-loader')
    .options(vueLoaderConfig)

  configChain.plugin('MpvuePlugin').use(MpvuePlugin)

  configChain.plugin('ExtractTextPlugin').use(ExtractTextPlugin, [
    {
      filename: utils.assetsPath('[name].wxss')
    }
  ])

  configChain.plugin('OptimizeCSSPlugin').use(OptimizeCSSPlugin, [
    {
      cssProcessorOptions: {
        safe: true
      }
    }
  ])

  // configChain.plugin('CopyWebpackPlugin-static').use(CopyWebpackPlugin, [
  //   [
  //     {
  //       from: utils.resolve('static'),
  //       to: '',
  //       ignore: ['.*']
  //     }
  //   ]
  // ])

  return configChain
}
