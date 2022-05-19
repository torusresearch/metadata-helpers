/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const { ProvidePlugin } = require("webpack");
const nodeExternals = require("webpack-node-externals");

const pkg = require("./package.json");

const pkgName = "metadataHelpers";

exports.baseConfig = {
  resolve: {
    alias: {
      "bn.js": path.resolve(__dirname, "node_modules/bn.js"),
      lodash: path.resolve(__dirname, "node_modules/lodash"),
      "js-sha3": path.resolve(__dirname, "node_modules/js-sha3"),
    },
  },
};

// const optimization = {
//   optimization: {
//     minimize: false,
//   },
// };

// const babelLoader = {
//   test: /\.(ts|js)x?$/,
//   exclude: /(node_modules|bower_components)/,
//   use: {
//     loader: "babel-loader",
//   },
// };

// const umdConfig = {
//   ...baseConfig,
//   output: {
//     ...baseConfig.output,
//     filename: `${pkgName}.umd.min.js`,
//     libraryTarget: "umd",
//   },
//   module: {
//     rules: [babelLoader],
//   },
// };

// const cjsConfig = {
//   ...baseConfig,
//   output: {
//     ...baseConfig.output,
//     filename: `${pkgName}.cjs.js`,
//     libraryTarget: "commonjs2",
//   },
//   module: {
//     rules: [babelLoader],
//   },
//   plugins: [
//     ...baseConfig.plugins,
//     new ESLintPlugin({
//       files: "src",
//       extensions: ".ts",
//     }),
//   ],
//   externals: [...Object.keys(pkg.dependencies), /^(@babel\/runtime)/i],
// };

// const cjsBundledConfig = {
//   ...baseConfig,
//   output: {
//     ...baseConfig.output,
//     filename: `${pkgName}-bundled.cjs.js`,
//     libraryTarget: "commonjs2",
//   },
//   module: {
//     rules: [babelLoader],
//   },
//   externals: [/^(@babel\/runtime)/i],
// };

exports.nodeConfig = {
  optimization: {
    minimize: false,
  },
  output: {
    filename: `${pkgName}-node.js`,
    library: {
      type: "commonjs2",
    },
  },
  externals: [
    nodeExternals({
      allowlist: "@toruslabs/http-helpers",
    }),
    "node-fetch",
    ...Object.keys(pkg.dependencies).filter((x) => !["@toruslabs/http-helpers"].includes(x)),
    /^(@babel\/runtime)/i,
  ],
  target: "node",
  plugins: [
    new ProvidePlugin({
      fetch: ["node-fetch", "default"],
    }),
  ],
};

// module.exports = [cjsConfig];

// v5
// experiments: {
//   outputModule: true
// }

// node: {
//   global: true,
// },
// resolve: {
//   alias: { crypto: 'crypto-browserify', stream: 'stream-browserify', vm: 'vm-browserify' },
//   aliasFields: ['browser'],
// },
