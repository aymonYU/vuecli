const configDev = require('./build/webpack.dev.conf.js')
const configPro = require('./build/webpack.prod.conf.js')
const path = require('path')
const fs = require('fs')
const webpack = require('./mpvue-webpack-target/node_modules/webpack')
const mpEntry = require('./mpvue-entry')
const MpvueServerPlugin = require('./plugin/index')
const rm = require('rimraf')

module.exports = (api, options) => {
  // if (options.pluginOptions.platform === 'mpvue') {
  api.registerCommand(
    'mpvue',
    {
      description: 'use mpvue loader',
      usage: 'vue-cli-service mpvue [options] [...files]'
    },
    args => {
      const config = api.resolveWebpackConfig()

      const { get } = require('@vue/cli-shared-utils')
      const { toString } = require('webpack-chain')
      const { _: paths, verbose } = args

      webpack(config, function (err, stats) {
        if (err) {
          console.log(err, 'xxxxx')
          throw err
        }
        process.stdout.write(stats.toString({
          colors: true,
          modules: false,
          children: false,
          chunks: false,
          chunkModules: false
        }) + '\n\n')
      })

      // let res
      // if (args.rule) {
      //   res = config.module.rules.find(r => r.__ruleNames[0] === args.rule)
      // } else if (args.plugin) {
      //   res = config.plugins.find(p => p.__pluginName === args.plugin)
      // } else if (args.rules) {
      //   res = config.module.rules.map(r => r.__ruleNames[0])
      // } else if (args.plugins) {
      //   res = config.plugins.map(p => p.__pluginName || p.constructor.name)
      // } else if (paths.length > 1) {
      //   res = {}
      //   paths.forEach(path => {
      //     res[path] = get(config, path)
      //   })
      // } else if (paths.length === 1) {
      //   res = get(config, paths[0])
      // } else {
      //   res = config
      // }

      // const output = toString(res, { verbose })

      // console.log(output)
      // fs.writeFile(process.cwd() + '/config.js', output, function () {
      //   console.log('打印成功')
      // })
    }
  )

  api.chainWebpack(async (configChain, options = {}) => {
    process.env.NODE_ENV = 'development'
    const context = process.cwd()

    const configPath = (
      process.env.VUE_CLI_SERVICE_CONFIG_PATH ||
      path.resolve(context, 'vue.config.js')
    )
    const { configureWebpack } = require(configPath)

    const p1 = path.resolve(__dirname, 'node_modules')

    options.watch = process.env.NODE_ENV === 'development'

    if (fs.existsSync(p1)) {
      configChain.resolveLoader.modules.prepend(p1)
    }
    configChain.plugins.clear()
    configChain.delete('mode')
    // configChain.plugins.delete('hmr')
    // configChain.plugins.delete('no-emit-on-errors')
    configChain.output.delete('globalObject')

    deleteRules(configChain, ['vue', 'css', 'postcss', 'scss', 'sass', 'less', 'stylus'])
    deletePlugin(configChain, ['vue-loader', 'define', 'html'])

    configChain = mpEntry(configChain, configureWebpack)

    const mpConfig = process.env.NODE_ENV === 'development' ? configDev : configPro

    console.log(process.env.NODE_ENV, 'mpConfig')

    configChain = mpConfig(configChain, options)

    configChain.plugin('define_plugin').use(webpack.DefinePlugin, [
      {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        BASE_URL: '"/"',
        PLATFORM: JSON.stringify('mpvue'),
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV)
        }
      }
    ])

    configChain.plugin('MpvueServerPlugin').use(MpvueServerPlugin, [
      {
        watch: options.watch
      }
    ])
    if (!options.watch) {
      await rm(
        path.resolve(process.cwd(), '/dist'),
        err => {
          if (err) {
            throw err
          }
        }
      )
    }
  })
  // }
}

function deletePlugin (config, arr) {
  arr.forEach(item => {
    config.plugins.delete(item)
  })
}
function deleteRules (config, arr) {
  arr.forEach(item => {
    config.module.rules.delete(item)
  })
}
