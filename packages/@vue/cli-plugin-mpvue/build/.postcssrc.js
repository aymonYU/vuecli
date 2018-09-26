// https://github.com/michael-ciniawsky/postcss-load-config

//官方示例
// {
//   "plugins": {
//     "postcss-mpvue-wxss": {}
//   }
// }
// 因为 postcss-load-config 在加载模块的时候使用了 import-cwd, 导致寻找模块的时候会出现异常
// 所以要用这种方式来避免

var p = require.resolve('postcss-mpvue-wxss');
var plugins = {};
plugins[p] = {};

module.exports = {
  "plugins": plugins
}