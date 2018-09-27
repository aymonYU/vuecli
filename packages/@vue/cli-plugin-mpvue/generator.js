module.exports = (api, options) => {
  const pkg = {
    scripts: {
      'mpvue:dev': 'vue-cli-service mpvue',
      'mpvue:build': "vue-cli-service mpvue  --mode 'production'"
    },
    devDependencies: {
      'vue-cli-plugin-mpvue': '^1.0.0'
    }
  }
  api.extendPackage(pkg)
}
