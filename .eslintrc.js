require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: ["@toruslabs/eslint-config-node"],
  parser: "@typescript-eslint/parser",
  ignorePatterns: ["*.config.js", ".eslintrc.js"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 11,
    project: "./tsconfig.json",
  },
};
