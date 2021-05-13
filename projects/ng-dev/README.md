## API Documentation

To quickly see what is available, see the [api documentation](https://simontonsoftware.github.io/s-libs/ng-dev).

## Installation

```
yarn add -D @s-libs/ng-dev @s-libs/ng-core @s-libs/rxjs-core @s-libs/js-core @s-libs/micro-dash @angular/cdk
```

## ESLint Config

This library comes with some default config you can use for ESLint. It to use it, first install [Angular ESLint](https://github.com/angular-eslint/angular-eslint) following their instructions for your situation. Make sure it is working with their minimal config, then change `.eslintrc.json` in your root directory to this:

```json
{ "extends": "@s-libs/ng-dev/eslint-config.json" }
```

This will give you all the recommended, community-standard rules from ESLint, "eslint:recommended",
@typescript-eslint, and @angular-eslint/recommended, plus these additions and changes:

- code complexity rules to keep your functions and files focused and readable
- relaxed rules around `ban-types` that Simonton Software has found unuseful
