// @ts-check
const tseslint = require("typescript-eslint");
const libraryConfig = require("./projects/eslint-config-ng/strict.js");

module.exports = tseslint.config(...libraryConfig, {
  ignores: ["**/*.dts-spec.ts"],
});
