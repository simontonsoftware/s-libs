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
          prefix: ["app", "sl"],
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: ["app", "sl"],
          style: "kebab-case",
        },
      ],

      // this library a bit legacy - it's built around observables not signals
      "@angular-eslint/prefer-signals": "off",
      // this library hides some type gymnastics from the user
      "@typescript-eslint/no-unsafe-type-assertion": "off",
    },
  },
  {
    files: ["**/*.spec.ts"],
    rules: {
      // tests simulate the expected result of modifying a State object in the store
      "@typescript-eslint/no-misused-spread": "off",
    },
  },
  {
    files: ["**/*.html"],
    rules: {},
  },
);
