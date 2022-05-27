const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const PACKAGE = require("./package.json");

const BANNER = `\
/**
 * @name BDCryptor
 * @version ${PACKAGE.version}
 * @description ${PACKAGE.description}
 *
 * @author ${PACKAGE.author.tag}
 * @authorLink ${PACKAGE.author.url}
 * @authorId ${PACKAGE.author.snowflake}
 *
 * @source ${PACKAGE.homepage}
 * @donate ${PACKAGE.funding}
 */`;

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "BDCryptor.plugin.js",
    library: {
      name: "BDCryptor",
      export: "BDCryptor",
      type: "var",
    },
  },
  externals: {
    BdApi: "BdApi",
    //Promise: "Promise",
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: {
          condition: false,
        },
        terserOptions: {
          output: {
            preamble: BANNER,
            semicolons: false,
          },
        },
      })
    ],
  },
};
