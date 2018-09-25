const server = require('./server')

const id = 'MpvueServerPlugin'
class MpvueServerPlugin {
  constructor (options) {
    this.options = options
  }

  hanler (compiler, webpackConfig) {
    // 1. webpack-chain 只能输出 {index: [xxx.js]} 类似结构的 entry
    // 2. mpvue-loader 需要 {index：xxx.js} 这样的 entry
    // 基于以上两点原因，需要在这里做一下结构整理
    for (const key in webpackConfig.entry) {
      const entryPage = webpackConfig.entry[key]
      if (Array.isArray(entryPage) && entryPage.length === 1) {
        webpackConfig.entry[key] = entryPage[0]
      }
    }

    if (this.options.watch) {
      server.start(compiler, webpackConfig)
    }
  }

  apply (compiler) {
    // 注意调试模式 与 正式模式下面使用的 hook 时机点不一样,否则会报错
    const hookName = this.options.watch ? 'run' : 'environment'
    const webpackConfig = compiler.options
    if (compiler.hooks) {
      // webpack 4
      compiler.hooks[hookName].tap(id, cc => {
        this.hanler(compiler, webpackConfig)
      })
    } else {
      // webpack < 4
      compiler.plugin(hookName, cc => {
        this.hanler(compiler, webpackConfig)
      })
    }
  }
}

module.exports = MpvueServerPlugin
