This library provides some default config you can use for ESLint in an Angular project. It gives you all the recommended, community-standard rules from ESLint,
@typescript-eslint, and @angular-eslint/recommended, plus these additions and changes:

- code complexity rules to keep your functions and files focused and readable
- relaxed rules around `ban-types` that Simonton Software has found unuseful

# Installation

1. First install [Angular ESLint](https://github.com/angular-eslint/angular-eslint) following their instructions for your situation. Make sure it is working with their minimal config.
1. `yarn add -D @s-libs/eslint-config-ng`
1. Change `.eslintrc.json` in your root directory to this, and make adjustments to suit your needs:

   ```json
   {
     "extends": "@s-libs/eslint-config-ng",
     "overrides": [
       {
         "files": ["*.ts"],
         "rules": {
           "@angular-eslint/directive-selector": [
             "error",
             { "type": "attribute", "prefix": "app", "style": "camelCase" }
           ],
           "@angular-eslint/component-selector": [
             "error",
             { "type": "element", "prefix": "app", "style": "kebab-case" }
           ]
         }
       }
     ]
   }
   ```
