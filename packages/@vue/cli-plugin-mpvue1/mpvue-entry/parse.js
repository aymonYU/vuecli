// 这个文件的内容来着 mpvue-loader/lib/mp-compiler/parse.js
const generate = require('babel-generator').default
const babelon = require('babelon')

function getImportsMap (metadata) {
  let { importsMap } = metadata
  const { imports } = metadata.modules

  if (!importsMap) {
    importsMap = {}
    imports.forEach(m => {
      m.specifiers.forEach(v => {
        importsMap[v.local] = m.source
      })
    })
    metadata.importsMap = importsMap
  }

  return metadata
}

// 解析 config
const traverseConfigVisitor = {
  Property: function (path) {
    const k = path.node.key.name || path.node.key.value
    if (k !== 'config') {
      return
    }
    path.stop()

    const { metadata } = path.hub.file
    const { code } = generate(path.node.value, {}, '')
    metadata.config = {
      code,
      node: path.node.value,
      value: babelon.eval(code)
    }

    // path.remove()
  }
}

// config 的遍历器
const configVisitor = {
  ExportDefaultDeclaration: function (path) {
    path.traverse(traverseConfigVisitor)
    path.remove()
  },
  NewExpression: function (path) {
    const { metadata } = path.hub.file
    const { importsMap } = getImportsMap(metadata)

    const calleeName = path.node.callee.name
    const isVue = /vue$/.test(importsMap[calleeName])

    if (!isVue) {
      return
    }

    const arg = path.node.arguments[0]

    if (!arg) {
      return
    }

    const v =
      arg.type === 'Identifier' ? importsMap[arg.name] : importsMap['App']
    metadata.rootComponent = v || importsMap['index'] || importsMap['main']
  }
}

function parseConfig () {
  return {
    visitor: configVisitor
  }
}

module.exports = {
  parseConfig
}
