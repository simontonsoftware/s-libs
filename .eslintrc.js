module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { project: "tsconfig.json", sourceType: "module" },
  plugins: ["@typescript-eslint"],
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
    "max-statements": ["error"],
  },
};
