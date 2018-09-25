// const configDev = require('./build/webpack.dev.conf.js')
// const configPro = require('./build/webpack.prod.conf.js')
const path = require('path')

const { exec } = require('child_process')
module.exports = (api, options) => {
  // if (options.pluginOptions.platform === 'mpvue') {
  api.registerCommand(
    'mpvue',
    {
      description: 'use mpvue loader',
      usage: 'vue-cli-service mpvue [options] [...files]'
    },
    args => {
      console.log(require.resolve('webpack'))
      exec(process.env.NODE_ENV === 'development' ? `node  ${path.resolve(__dirname, './build/dev-server.js')}` : `node  ${path.resolve(__dirname, './build/build.js')}`, (err, stdout, stderr) => {
        if (err) {
          console.error(err)
          return
        }
        console.log(stdout)
      })
    }

  )
}

