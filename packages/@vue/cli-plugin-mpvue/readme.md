build 文件夹和 config 文件夹是从官方demo拷贝的

mpvue entry 


// 项目内文件绝对路径获取函数
function resolveApp(dir) {
  // return path.join(path.dirname(require.main.filename), '..', dir);
  return path.resolve(process.cwd(), dir);
}