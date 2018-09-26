/* changed all*/

process.env.NODE_ENV = 'development'

var config = require('../config')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
var proxyTable = config.dev.proxyTable

var app = express()
var compiler = webpack(webpackConfig)

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

app.use('/static', express.static(path.resolve(process.cwd(), 'dist')))

app.listen(port, 'localhost')

// for 小程序的文件保存机制
require('webpack-dev-middleware-hard-disk')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

