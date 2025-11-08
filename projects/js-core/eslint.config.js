// @ts-check
const tseslint = require("typescript-eslint");
const rootConfig = require("../../eslint.config.js");

module.exports = tseslint.config(
  ...rootConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "sl",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "sl",
          style: "kebab-case",
        },
      ],

      // several utility functions define typing carefully in overloads, and use `any` in the code
      "@typescript-eslint/no-unsafe-type-assertion": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },
  {
    files: ["**/*.spec.ts"],
    rules: {
      // tests use empty functions just to satisfy parameters
      "@typescript-eslint/no-empty-function": "off",
    },
  },
);
