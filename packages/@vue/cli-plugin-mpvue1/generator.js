module.exports = (api, options) => {
  const pkg = {
    scripts: {
      mpvue: 'vue-cli-service mpvue'
    },
    devDependencies: {
      'vue-cli-plugin-mpvue': '^1.0.0'
    }
  }
  api.extendPackage(pkg)
}
