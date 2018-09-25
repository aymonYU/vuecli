const path = require('path')

let server = null

const express = require('express')

const proxyMiddleware = require('http-proxy-middleware')

function start (compiler, webpackConfig) {
  // automatically open browser, if not set will be false
  // Define HTTP proxies to your custom API backend
  // https://github.com/chimurai/http-proxy-middleware
  const proxyTable = {}

  const app = express()

  // proxy api requests
  Object.keys(proxyTable).forEach(function (context) {
    let options = proxyTable[context]
    if (typeof options === 'string') {
      options = {
        target: options
      }
    }
    app.use(proxyMiddleware(options.filter || context, options))
  })

  // handle fallback for HTML5 history API
  app.use(require('connect-history-api-fallback')())

  app.use('/local', express.static(path.resolve(process.cwd(), 'dist')))

  const port =
    (webpackConfig.devServer && webpackConfig.devServer.port) || 9394

  server = app.listen(port, 'localhost')

  // for 小程序的文件保存机制
  require('webpack-dev-middleware-hard-disk')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
  })
}
module.exports = {
  start: start,
  close: () => {
    server && server.close()
  }
}
