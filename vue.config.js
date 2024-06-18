const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  pwa: {
    name: "ProEcole",
    themeColor: "#e5e7eb",
    msTileColor: "#e5e7eb",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "#ffffff",
  }
})
