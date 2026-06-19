// @ts-check
const { defineConfig } = require('eslint/config');
const slibs = require('./projects/eslint-config-ng/strict.js');

module.exports = defineConfig([
  ...slibs,
  { ignores: ['**/*.dts-spec.ts', '**/vitest-base.config.ts'] },
]);
