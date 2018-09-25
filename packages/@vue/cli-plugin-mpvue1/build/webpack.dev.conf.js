const baseWebpackConfig = require('./webpack.base.conf')

module.exports = function (configChain) {
  configChain = baseWebpackConfig(configChain, true)

  return configChain
}
