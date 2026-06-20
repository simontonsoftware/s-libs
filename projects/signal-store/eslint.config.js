// @ts-check
const { defineConfig } = require('eslint/config');
const rootConfig = require('../../eslint.config.js');

module.exports = defineConfig([
  ...rootConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: ['app', 'sl'],
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['app', 'sl'],
          style: 'kebab-case',
        },
      ],

      // We do a lot of type gymnastics! End users should not need to, but within this library there's lots of "unsafe" casting.
      '@typescript-eslint/no-unsafe-type-assertion': 'off',

      // ESLint had stack overflow errors on this rule. I didn't manage to solve them.
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
  {
    files: ['**/*.html'],
    rules: {},
  },
]);
