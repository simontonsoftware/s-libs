// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      complexity: ["error", { max: 5 }],
      "max-depth": ["error", { max: 3 }],
      "max-lines": [
        "error",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "error",
        { max: 25, skipBlankLines: true, skipComments: true },
      ],
      "max-nested-callbacks": ["error", { max: 2 }],

      // I have not found good alternatives to `object` in the cases I've used it
      "@typescript-eslint/ban-types": [
        "error",
        { types: { object: false }, extendDefaults: true },
      ],
    },
  },
  {
    files: ["**/*.spec.ts"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-nested-callbacks": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  },
);
