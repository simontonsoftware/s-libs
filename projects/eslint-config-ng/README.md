This library provides some default config you can use for ESLint in an Angular project.

# "Recommended" Config

Follow these instructions to get all the community-recommended config from [`ESLint`](https://eslint.org/docs/rules/),
[`@typescript-eslint`](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/eslint-recommended.ts), and [`@angular-eslint`](https://github.com/angular-eslint/angular-eslint).

1. First install [Angular ESLint](https://github.com/angular-eslint/angular-eslint), following their instructions for your situation. Make sure it is working with their default config.
1. `npm install --save-dev @s-libs/eslint-config-ng`
1. Change `eslint.config.js` in your root directory to this, and make adjustments to suit your needs:

   ```js
   // @ts-check
   const tseslint = require('typescript-eslint');
   const slibs = require('@s-libs/eslint-config-ng');

   module.exports = tseslint.config(...slibs, {
     files: ['**/*.ts'],
     rules: {
       '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
       '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
     },
   });
   ```

# Strict Config

Use these instructions for much stricter linting, start with the instructions above then continue with these. It starts with _all_ rules from the libraries above, then turns _off_ or modifies rules that Simonton Software subjectively thinks makes the config better.

1. Follow the instructions above for recommended config and ensure it works.
1. `npm install --save-dev eslint-config-prettier`
1. Change the `require` in `eslint.config.js` to `@s-libs/eslint-config-ng/strict`
1. Add `languageOptions` to the `eslint.config.js` file you created, so it looks like this:

   ```js
   // @ts-check
   const tseslint = require('typescript-eslint');
   const slibs = require('@s-libs/eslint-config-ng/strict');

   module.exports = tseslint.config(...slibs, {
     files: ['**/*.ts'],
     languageOptions: { parserOptions: { projectService: true } },
     rules: {
       '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
       '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
     },
   });
   ```

**Warning:** the configs from underlying libraries is not as stable as the ones used for their "recommended" configs. It can change with minor version updates to the underlying libraries.
