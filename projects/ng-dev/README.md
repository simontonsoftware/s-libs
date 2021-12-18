## API Documentation

To quickly see what is available, see the [api documentation](https://simontonsoftware.github.io/s-libs/ng-dev).

## Installation

```
yarn add @s-libs/ng-core @s-libs/rxjs-core @s-libs/js-core @s-libs/micro-dash @angular/cdk
yarn add -D @s-libs/ng-dev
```

## Fixing Jasmine Clock

If you are creating a library project and use [`Angular Context`](https://simontonsoftware.github.io/s-libs/ng-dev/classes/AngularContext.html) or [`Component Context`](https://simontonsoftware.github.io/s-libs/ng-dev/classes/ComponentContext.html) for its tests, you may run into this error:

```
Error: Jasmine Clock was unable to install over custom global timer functions. Is the clock already installed?
```

You can see details on Angular's issue filed [here](https://github.com/angular/angular-cli/issues/14432). To work around it, create a new file `projects/your-lib-name/src/test-polyfills.ts` with this code:

```ts
// This file can be deleted after https://github.com/angular/angular-cli/issues/14432. Be sure to delete it from `angular.json`, `tsconfig.lib.json`, and `tsconfig.spec.json`, too.
import "zone.js";
```

Add this innermost "polyfills" line to your `angular.json`:

```json
{
  "projects": {
    "your-lib-name": {
      "architect": {
        "test": {
          "options": {
            "polyfills": "projects/ng-mat-core/src/test-polyfills.ts"
          }
        }
      }
    }
  }
}
```

Add it to the "exclude" property in your `tsconfig.lib.json`:

```json
{
  "exclude": ["src/test-polyfills.ts"]
}
```

Add it to the "include" property in `tsconfig.spec.json`:

```json
{
  "include": ["src/test-polyfills.ts"]
}
```
