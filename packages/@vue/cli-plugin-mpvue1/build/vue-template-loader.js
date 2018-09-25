const htmlparser = require('htmlparser2')

function attribsReplace (originTag, weexTag, attrName, attrValue) {
  if (attrValue === undefined) return attrName

  var quot = attrValue.indexOf('"') > -1 ? "'" : '"'

  attrName = attrName || ''

  switch (attrName.toLowerCase()) {
  default: {
    const m = attrName.match(/^v-tap(\.stop|prevent)?/)
    if (m) {
      // 处理 v-tap
      // 这个正则匹配：someMethods.bind(this, 'abc', 123)
      var regBindThis = /(\w+)\.bind\s*\(\s*this\s*,\s*/gim

      attrValue = attrValue.replace(regBindThis, '$1(')

      var regBindThis2 = /(\w+)\.bind\s*\(\s*this\s*\)\s*/gim

      attrValue = attrValue.replace(regBindThis2, '$1')

      return ` @click=${quot}${attrValue}${quot}`
    }
  }
  }

  return ` ${attrName}=${quot}${attrValue}${quot}`
}

function compile (content) {
  var promise = new Promise(resolve => {
    // 最后的总输出用数组存下来
    const output = []
    // 用入栈出栈的形式来准确处理 closetag
    const tagStack = []
    var parser = new htmlparser.Parser(
      {
        onopentag: function (name, attribs) {
          var attribsStr = ''
          for (const attrName in attribs) {
            attribsStr += attribsReplace(
              name,
              name,
              attrName,
              attribs[attrName]
            )
          }

          const tagContent = `<${name}${attribsStr}>`

          tagStack.push({
            tagname: name,
            attribs: attribs
          })

          output.push(tagContent)
        },
        ontext: function (text) {
          output.push(text)
        },
        onclosetag: function () {
          const lastTag = tagStack.pop()
          output.push(`</${lastTag.tagname}>`)
        },
        onend: function () {
          var template = output.join('')
          resolve(template)
        }
      },
      {
        recognizeSelfClosing: true,
        lowerCaseAttributeNames: false,
        lowerCaseTags: false,
        decodeEntities: true
      }
    )

    parser.write(content)
    parser.end()
  })

  return promise
}

module.exports = compile
