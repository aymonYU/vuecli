const utils = require('./utils')
const path = require('path')

// var isProduction = process.env.NODE_ENV === 'production'
// for mp

const isProduction = true
let cssLoaders = utils.cssLoaders({
  sourceMap: false,
  extract: isProduction
})

cssLoaders = Object.assign(cssLoaders, {
  html: path.resolve(__dirname, 'vue-template-loader.js')
})

module.exports = {
  loaders: cssLoaders,
  transformToRequire: {
    video: 'src',
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
