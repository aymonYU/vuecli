const path = require('path')
const fs = require('fs')
const read = require('fs-readdir-recursive')
const babel = require('babel-core')
const { parseConfig } = require('./parse')
const CopyWebpackPlugin = require('copy-webpack-plugin')

/**
 * 遍历整个 src/pages 目录，查找 .vue 文件
 * @param  {Boolean} isDev [description]
 * @return {[type]}        [description]
 */
function getVuePages (isDev) {
  const sourcePath = process.cwd()
  const pagesPath = path.resolve(sourcePath, 'src/pages')

  let list = read(pagesPath) // 不要用官方filter，windows下有bug

  // 统一 window mac 的路径风格
  list = list.map(item => {
    return item.split(path.sep).join('/')
  })

  list = list.filter(item => {
    let flag = /\.vue$/.test(item) // 获取.vue结尾文件
    if (!isDev) {
      flag = flag && !/^demo\//.test(item) // 过滤构建稿目录（demo）
    }

    return flag
  })

  const routes = list.map(item => {
    const page = item.replace(/\.vue$/, '')
    return {
      file: path.resolve(sourcePath, 'src/pages', item).replace(/\\/g, '/'),
      page: 'pages/' + page
    }
  })

  return routes
}

/**
 * 生成 mpvue-loader 需要的 entry 节点
 * @return {[type]} [description]
 */
module.exports = (config, userWebpack) => {
  const sourcePath = process.cwd()

  let appConfig = {}

  const _entry = userWebpack.entry

  const entryCompiled = babel.transformFileSync(_entry, {
    plugins: [parseConfig]
  })

  const copyList = []

  if (entryCompiled.metadata && entryCompiled.metadata.config) {
    appConfig = entryCompiled.metadata.config.value

    // 接下来尝试自动分析出配置文件里面的图片(tabbar 图标), 准备 copy 到 dist/mpvue 目录
    const strCfg = JSON.stringify(entryCompiled.metadata.config.value)

    const imgReg = /"([^"]+\.(png|jpe?g|gif|svg))"/g
    let t = imgReg.exec(strCfg)
    while (t) {
      const img = t[0].replace(/"/g, '')
      if (fs.existsSync(path.resolve(sourcePath, 'src', img))) {
        // t[0] 举例 "images/index/home.png"
        copyList.push({
          from: img,
          to: img
        })
      }
      t = imgReg.exec(strCfg)
    }
  }

  // entry 文件下面 export 一个 json 出来
  // json 下面需要有一个 config 节点
  // config 节点下面有 pages 字段
  // pages 字段支持多种语义:
  // ! 号开头代表排除某个 page : pages: ["!pages/a"]
  // 只包含一个非 ! 开头的 page, 用于指定首页: pages: ["pages/a"]
  // 包含多于1个非 ! 开头的page,代表指定编译这些文件: pages: ["pages/a", "pages/folder/b"]

  let pagesInConfig = [] // 入口文件指定的页面
  const pagesExclude = [] // 需要排除的页面
  if (appConfig.pages && appConfig.pages.length) {
    appConfig.pages.forEach(page => {
      if (page.indexOf('!') === 0) {
        pagesExclude.push(page.replace(/^!/, ''))
      } else {
        pagesInConfig.push(page.replace(/^\^/, '')) // 老的代码有使用 ^ 号的情况
      }
    })
  }

  let vuePages = getVuePages()

  vuePages = vuePages.filter(item => pagesExclude.indexOf(item.page) < 0)

  if (pagesInConfig.length === 0) {
    pagesInConfig = vuePages.map(item => item.page)
  } else if (pagesInConfig.length === 1) {
    vuePages.forEach(item => {
      if (pagesInConfig.indexOf(item.page) < 0) {
        pagesInConfig.push(item.page)
      }
    })
  }

  appConfig.pages = pagesInConfig

  const entryFolder = path.resolve(__dirname, 'pages')

  // entry/mpvue.js 下面 config 字段如果填写了超过一个 pages
  // 那么代表需要按需编译
  const pagesEntry = vuePages.reduce((res, item) => {
    const pageKey = item.page

    if (appConfig.pages.indexOf(pageKey) > -1) {
      const entryContent = `
        import Vue from 'vue';
        import App from '${item.file.replace(/\\/g, ' / ')}';

        const app = new Vue(App);
        app.$mount()
    `
      const entryFile = path.resolve(
        entryFolder,
        pageKey.replace(/\//g, '_') + '.js'
      )
      fs.writeFileSync(entryFile, entryContent)
      res[pageKey] = entryFile
    }

    return res
  }, {})

  const appEntry = {
    app: _entry
  }

  const entry = Object.assign({}, appEntry, pagesEntry)

  config.entryPoints.clear()

  for (const key in entry) {
    config.entry(key).add(entry[key])
  }

  const rulejs = config.module.rule('mpentry').test(function (file) {
    return file.indexOf(entryFolder) === 0
  })

  rulejs
    .use('mpvue')
    .loader('mpvue-loader')
    .options({
      checkMPEntry: true
    })

  copyList.push({
    from: 'pages/**/*.json',
    to: ''
  })

  copyList.push({
    from: _entry,
    to: 'app.json',
    transform () {
      return JSON.stringify(appConfig, null, '\t')
    }
  })

  config.plugin('CopyWebpackPlugin-json').use(CopyWebpackPlugin, [
    copyList,
    {
      context: 'src/'
    }
  ])

  return config
}
