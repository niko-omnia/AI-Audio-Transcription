const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",

  entry: {
    popup: "./src/index.tsx",
    background: "./src/services/background.ts",
    contentScript: "./public/content-script.ts",
    offscreen: "./public/offscreen.ts",
    recorder: "./src/recorder.ts"
  },

  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",
    clean: true
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader", "postcss-loader"]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/popup.html",
      filename: "popup.html",
      chunks: ["popup"]
    }),

    new CopyPlugin({
      patterns: [
        {
          from: "manifest.json",
          to: "manifest.json"
        },
        {
          from: "public/recorder.html",
          to: "recorder.html"
        },
        {
          from: "public/offscreen.html",
          to: "offscreen.html"
        }
      ]
    })
  ]
};
