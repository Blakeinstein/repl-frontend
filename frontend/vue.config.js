/* eslint-disable @typescript-eslint/no-var-requires */
const MonacoEditorPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
  lintOnSave: true,
  configureWebpack: {
    plugins: [new MonacoEditorPlugin()],
  },
};
