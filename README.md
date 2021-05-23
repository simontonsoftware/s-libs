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
- [`eslint-config-ng`](https://github.com/simontonsoftware/s-libs/tree/master/projects/eslint-config-dev):

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

However, there are extra steps to follow for these libraries, outlined in their separate readmes:

- `s-ng-dev-utils` -> `@s-libs/ng-dev`: check the upgrade guide [here](https://github.com/simontonsoftware/s-libs/tree/master/projects/ng-dev#upgrading-from-the-non-s-libs-version).
- `ng-app-state` -> `@s-libs/app-state`: check the upgrade guide [here](https://github.com/simontonsoftware/s-libs/tree/master/projects/app-state#upgrading-from-the-non-s-libs-version).
