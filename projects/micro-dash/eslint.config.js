// @ts-check
const tseslint = require('typescript-eslint');
const rootConfig = require('../../eslint.config.js');

module.exports = tseslint.config(
  ...rootConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      // It would be nice to remove these and fix up the code. Or at least put more thought into it before declaring these exceptions final.
      '@typescript-eslint/no-empty-object-type': 'off',

      // The typing gets very verbose when handling rest params. It may be possible to rewrite these with more modern TypeScript, so this could be revisited in the future.
      '@typescript-eslint/max-params': 'off',

      // lodash tests that we copy commonly violate these
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/require-array-sort-compare': 'off',

      // micro-dash tests do weird things to make sure the library works for users when they do weird things.
      '@typescript-eslint/no-empty-function': 'off',
      'no-sparse-arrays': 'off',
      'prefer-regex-literals': 'off',
      'prefer-rest-params': 'off',

      // we often define typing carefully in overloads, and use `any` or `Function` in the code
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',

      // we knowingly violate some standards for the sake of smaller bundle size
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      complexity: 'off',
      eqeqeq: 'off',
      'func-names': 'off',
      'max-depth': 'off',
      'max-lines-per-function': 'off',
      'no-bitwise': 'off',
      'no-eq-null': 'off',
      'no-multi-assign': 'off',
      'no-prototype-builtins': 'off',
      'prefer-const': 'off',
      'prefer-named-capture-group': 'off',
      'require-unicode-regexp': 'off',

      // some functions accept iteratees that return either void or boolean
      '@typescript-eslint/no-invalid-void-type': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      // several tests use an anonymous function just to get an `arguments` object
      'func-names': 'off',

      // tests copied from lodash use this technique
      '@typescript-eslint/no-array-delete': 'off',
    },
  },
);
