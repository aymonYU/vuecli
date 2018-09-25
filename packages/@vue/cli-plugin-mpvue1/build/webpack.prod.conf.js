const webpack = require('../mpvue-webpack-target/node_modules/webpack')
const baseWebpackConfig = require('./webpack.base.conf')

module.exports = function (configChain) {
  configChain = baseWebpackConfig(configChain, false)

  configChain.plugin('UglifyJsPlugin').use(webpack.optimize.UglifyJsPlugin, [
    {
      compress: {
        warnings: false
      },
      sourceMap: true
    }
  ])

  return configChain
}
