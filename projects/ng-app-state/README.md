`ng-app-state` is built on top of [`ngrx/store`](https://github.com/ngrx/platform), bringing you the same help writing performant, consistent applications for Angular in a format more familiar for those not accustomed to functional programming.

[![Build Status](https://travis-ci.org/simontonsoftware/ng-app-state.svg?branch=master)](https://travis-ci.org/simontonsoftware/ng-app-state) [![Coverage Status](https://coveralls.io/repos/github/simontonsoftware/ng-app-state/badge.svg?branch=master)](https://coveralls.io/github/simontonsoftware/ng-app-state?branch=master)

## Simonton Software Typescript Libraries

`ng-app-state` is one library in a suite that is available from Simonton Software. Each one builds on the last, organized by their dependencies:

1. [`micro-dash`](https://github.com/simontonsoftware/micro-dash): A much smaller Lodash
1. [`s-js-utils`](https://github.com/simontonsoftware/s-js-utils): Miscellaneous utilities written in TypeScript
1. [`s-rxjs-utils`](https://github.com/simontonsoftware/s-rxjs-utils): Miscellaneous utilities for RxJS
1. [`s-ng-utils`](https://github.com/simontonsoftware/s-ng-utils): Miscellaneous utilities for Angular
1. **`ng-app-state`: Object-oriented wrapper around `@ngrx/store`**

## API Documentation

Once you are familiar with the basics, it may help to see the [api documentation](https://simontonsoftware.github.io/ng-app-state/typedoc).

## Installation

Install along with its peer dependencies using:

```shell script
npm install --save ng-app-state @ngrx/store s-ng-utils s-rxjs-utils s-js-utils micro-dash

# OR

yarn add ng-app-state @ngrx/store s-ng-utils s-rxjs-utils s-js-utils micro-dash
```

## Template Driven Forms

This library includes the `[nasModel]` directive that you can use in place of `[(ngModel)]` to bind form controls directly to store objects. For example, to edit the current user's name in the example above:

```ts
@Component({
  template: ` <input [nasModel]="nameStore" /> `,
})
class AccountSettingsComponent {
  nameStore: StoreObject<string>;

  constructor(myStore: MyStore) {
    this.nameStore = myStore("currentUser")("name");
  }
}
```

`[nasModel]` is tested to work with all standard form controls. Except where noted, they all bind to `StoreObject<string>` objects.

- `<input type="checkbox">` - binds to `StoreObject<boolean>`
- `<input type="color">`
- `<input type="date">`
- `<input type="datetime-local">`
- `<input type="email">`
- `<input type="month">`
- `<input type="number">` - binds to `StoreObject<number>`
- `<input type="password">`
- `<input type="radio">`
- `<input type="range">` - binds to `StoreObject<number>`
- `<input type="search">`
- `<input type="tel">`
- `<input type="text">`
- `<input type="time">`
- `<input type="url">`
- `<input type="week">`
- `<input>`
- `<select multiple>` - binds to `StoreObject<string[]>`
- `<select>`
- `<textarea>`

To gain access to `[nasModel]`, add `NasModelModule` to the list of imports in your module.
