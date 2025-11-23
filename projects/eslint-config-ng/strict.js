// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.all,
      tseslint.configs.all,
      angular.configs.tsAll,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Not sure what's going on here. Docs say these options are default, but it's not behaving that way.
      'max-lines': ['error', { skipBlankLines: true, skipComments: true }],

      // Better compatibility with Angular
      '@typescript-eslint/no-extraneous-class': [
        'error',
        { allowWithDecorator: true },
      ],
      'accessor-pairs': 'off', // a lone setter or getter is nice for bindings
      'new-cap': 'off', // This errs on decorators

      // Better compatibility with s-libs
      '@typescript-eslint/unbound-method': 'off',

      // Some builtin TS and some Angular typing uses `any`, like `Object.getPrototypeOf()` and`ComponentFixture.nativeElement`
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',

      // Subjectively better options
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'no-public' },
      ],
      '@typescript-eslint/parameter-properties': [
        'error',
        { prefer: 'parameter-property' },
      ],
      // this would be great if you could limit it to `[0]`. But even `[2]` is awkward to "fix".
      '@typescript-eslint/prefer-destructuring': ['error', { array: false }],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
          allowBoolean: true,
          allowNullish: true,
          allowRegExp: true,
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          considerDefaultExhaustiveForUnions: true,
          requireDefaultForNonUnion: true,
        },
      ],
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'one-var': ['error', 'never'],
      'prefer-const': ['error', { ignoreReadBeforeAssign: true }],
      'spaced-comment': ['error', 'always', { exceptions: ['/'] }],

      // Subjectively undesirable
      '@angular-eslint/use-component-selector': 'off',
      '@angular-eslint/use-injectable-provided-in': 'off',
      '@typescript-eslint/class-methods-use-this': 'off', // there are valid reasons, like to leverage polymorphism
      '@typescript-eslint/consistent-type-exports': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/init-declarations': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-type-alias': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/prefer-readonly': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      'capitalized-comments': 'off',
      'default-case': 'off', // conflicts with "@typescript-eslint/switch-exhaustiveness-check"
      'id-length': 'off',
      'line-comment-position': 'off',
      'max-classes-per-file': 'off',
      'max-statements': 'off',
      'multiline-comment-style': 'off',
      'no-await-in-loop': 'off',
      'no-console': 'off',
      'no-continue': 'off',
      'no-else-return': 'off',
      'no-implicit-coercion': ['error', { allow: ['!!', '+'] }],
      'no-inline-comments': 'off',
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'no-ternary': 'off',
      'no-undefined': 'off',
      'no-underscore-dangle': 'off',
      'sort-imports': 'off',
      'sort-keys': 'off',

      // Handled better by TypeScript
      '@typescript-eslint/no-unused-vars': 'off',

      // Rules the libraries themselves recommend not using. /shrug
      '@angular-eslint/prefer-standalone-component': 'off', // deprecated
      '@typescript-eslint/lines-between-class-members': 'off',

      // no longer recommended by the Angular team
      '@angular-eslint/component-class-suffix': 'off',
      '@angular-eslint/directive-class-suffix': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      // Subjectively undesirable
      '@angular-eslint/component-max-inline-declarations': 'off',
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-statements': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateAll],
    rules: {
      // Subjectively undesirable
      '@angular-eslint/template/button-has-type': 'off',
      '@angular-eslint/template/i18n': 'off',
      '@angular-eslint/template/no-call-expression': 'off',
      '@angular-eslint/template/no-inline-styles': 'off',
      '@angular-eslint/template/use-track-by-function': 'off',
    },
  },
]);
