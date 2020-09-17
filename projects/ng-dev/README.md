[![Build Status](https://travis-ci.org/simontonsoftware/s-ng-dev-utils.svg?branch=master)](https://travis-ci.org/simontonsoftware/s-ng-dev-utils) [![Coverage Status](https://coveralls.io/repos/github/simontonsoftware/s-ng-dev-utils/badge.svg?branch=master)](https://coveralls.io/github/simontonsoftware/s-ng-dev-utils?branch=master)

## API Documentation

To quickly see what is available, see the [api documentation](https://simontonsoftware.github.io/s-ng-dev-utils/typedoc).

## Installation

```
yarn add -D s-ng-dev-utils
```

## TSLint Config

This library comes with a predefined `tslint.json` that track's the angular cli's config with these changes that we have found useful:

- Disables rules that conflict with Prettier (via [tslint-config-prettier](https://github.com/prettier/tslint-config-prettier))
- Allows using the `Function` type. Some of our libraries deal a lot with utilities that operate on functions, and using this type is very handy.
- Downgrades [no-any]() to a warning. While we try to avoid it, we find it a necessary evil at times (at least for our sanity).
- Downgrades [no-non-null-assertion](https://palantir.github.io/tslint/rules/no-non-null-assertion/) to a warning. While we believe using `!` should be avoided when reasonable, we find that sometimes it just makes sense.
- Allows prefixing variables with `_`. This is useful e.g. when overriding a method in a way that does not use all its parameters. We use typescript's "noUnusedParameters" option, which gives an error with unused parameters unless their names are prefixed with `_`.

To use it, change your `tslint.json` to:

```json
{
  "extends": "s-ng-dev-utils/tslint"
}
```

## ESLint Config

This library comes with configuration to lint code complexity and length using ESLint. Eventually we expect the Angular CLI to switch to ESLint because TSLint is deprecated. After that this should require less configuration to activate, but for now it requires all these steps:

1. Add a file `.eslintrc.js` to your project root like this:
   ```js
   module.exports = require("s-ng-dev-utils/.eslintrc");
   ```
1. Add a file `.eslintignore` to your project root like this (and tweak to fit your needs):

   ```
   /.idea/
   /coverage/
   /dist/
   /docs/
   /node_modules/
   karma.conf.js
   *.spec.ts
   ```

1. Modify your `package.json`'s lint script to include ESLint:
   ```
   "lint": "ng lint && eslint . --ext .js,.jsx,.ts,.tsx",
   ```
