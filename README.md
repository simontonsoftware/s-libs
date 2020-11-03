[![Test Suite](https://github.com/simontonsoftware/s-libs/workflows/Test%20Suite/badge.svg)](https://github.com/simontonsoftware/s-libs/actions)

# S-Libs

This is a collection of libraries from Simonton Software, written in TypeScript for use in any modern javascript buildchain.

- [`micro-dash`](https://github.com/simontonsoftware/s-libs/tree/master/projects/micro-dash): A much smaller Lodash
- [`js-core`](https://github.com/simontonsoftware/s-libs/tree/master/projects/js-core): Miscellaneous utilities written in TypeScript
- [`rxjs-core`](https://github.com/simontonsoftware/s-libs/tree/master/projects/rxjs-core): Miscellaneous utilities for RxJS
- [`app-state`](https://github.com/simontonsoftware/s-libs/tree/master/projects/app-state): An observable state management library
- [`ng-core`](https://github.com/simontonsoftware/s-libs/tree/master/projects/ng-core): Miscellaneous utilities for Angular
- [`ng-app-state`](https://github.com/simontonsoftware/s-libs/tree/master/projects/ng-app-state): Painlessly integrate `app-state` into template-driven Angular forms
- [`ng-dev`](https://github.com/simontonsoftware/s-libs/tree/master/projects/ng-dev): Miscellaneous utilities to use while developing Angular apps

## Upgrading from the loose packages

Many of the projects in S-Libs used to live in their own separate packages:

- [`micro-dash`](https://github.com/simontonsoftware/micro-dash) now lives in this package, with the same name
- [`s-js-utils`](https://github.com/simontonsoftware/s-js-utils) is now `js-core`
- [`s-rxjs-utils`](https://github.com/simontonsoftware/s-rxjs-utils) is now `rxjs-core`
- [`s-ng-utils`](https://github.com/simontonsoftware/s-ng-utils) is now `ng-core`
- [`ng-app-state`](https://github.com/simontonsoftware/ng-app-state) was split into 2 packages: `app-state`, and for the Angular template bindings `ng-app-state`
- [`s-ng-dev-utils`](https://github.com/simontonsoftware/s-ng-dev-utils) is now `ng-dev`

For most of them, upgrading simply requires:

1. Uninstalling the old package
1. Installing the new package
1. Replace the same imports in your code to be from the new package instead of the old one, e.g.

   ```ts
   // old
   import { map } from "micro-dash";
   import { elpasedToString } from "s-js-utils";

   // new
   import { map } from "@s-libs/micro-dash";
   import { elpasedToString } from "@s-libs/js-core";
   ```

However, the following features require a more complex upgrade path:

### `s-ng-dev-utils` -> `@s-libs/ng-dev`

- If you use the provided TSLint config, in open `tslint.json` and replace `s-ng-dev-utils/tslint` with `@s-libs/ng-dev/tslint`.
- If you use the provided ESLint config, open `.eslintrc.js` and replace `s-ng-dev-utils/.eslintrc` with `@s-libs/ng-dev/.eslintrc`.

### `ng-app-state` -> `@s-libs/app-state`

App state no longer depends on `@ngrx/store`. Among other changes, it is now a standalone library, depending only on other packages in S-Libs. There are also some exciting performance improvements. In the end, you'll need to make these changes:

- Remove `@ngrx/store` and `@ngrx/store-devtools` from your project, unless you are using them outside of `app-state`.
- Remove `StoreModule.forRoot()`, `ngAppStateReducer`, and `StoreDevtoolsModule.instrument()` from `app.module.ts`.
- To log state changes to the redux devtools extension, check out the new [`logToReduxDevtoolsExtension()`](file:///C:/Users/xemno/IdeaProjects/s-libs/docs/rxjs-core/index.html#logtoreduxdevtoolsextension) in `@s-libs/rxjs-core`. For example if you make your own subclass of `RootStore`, you could put this in its constructor:

  ```ts
  logToReduxDevtoolsExtension(this.$, {
    name: "MyStore",
    autoPause: true,
  });
  ```

- Replace references to `StoreObject` with `Store`.
- Replace references to `AppStore` with `RootStore`.
- The constructor for `RootStore` takes only 1 argument: its starting state. When transitioning from `AppStore` to `RootStore`, remove the other 2 arguments.
- Remove calls to `withCaching()`. The redesigned library comes with intelligent caching built in automatically.
- Batches are no longer tied to a specific slice of the store, but always operate on the entire `RootStore`. Therefore the callback to `batch()` no longer receives a `Store` object and `.inBatch()` has been removed. Instead operate on the store using any existing store object and it will automatically be included in the batch.
