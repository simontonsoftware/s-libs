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

## Introduction

A basic idea behind this library (as well as the underlying `ngrx/store`, and `Redux` on which it is modeled) is to keep all the state of your app in one place, accessible for any component or service to access, modify and subscribe to changes. This has several benefits:

- Components no longer need multiples inputs and outputs to route state and mutations to the proper components. Instead they can obtain the store via dependency injection.
- During debugging you can look in one place to see the state of your entire app. Moreover, development tools can be used to see this information at a glance along with a full history of changes leading up to the current state, e.g. the [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) or [ngrx-store-logger](https://github.com/btroncone/ngrx-store-logger).
- The objects in the store are immutable (as long as you only modify the state via the store, as you should), which enables more benefits:
  - Immutable objects all you to use Angular's on-push change detection, which can be a huge performance gain for apps with a large state.
  - Undo/redo features become very simple. This library includes a helper to make it even easier (more info below).
- Every piece of state is observable. You can subscribe to the root of the store to get notified of every state change anywhere in the app, for a specific boolean buried deep within your state, or anywhere in between.

2 terms are worth defining immediately. As they are used in this library, they mean:

- **State**: a javascript object (or primitive) kept within the store. A subset of the entire application state is still considered state on its own.
- **Store**: the keeper of state. You will always interact with the state via the store, whether to access it, observe it or modify it. You can obtain store objects to represent a subset of your state as well, which are also store objects on their own.

## Installation

Install along with its peer dependencies using:

```shell script
npm install --save ng-app-state @ngrx/store s-ng-utils s-rxjs-utils s-js-utils micro-dash

# OR

yarn add ng-app-state @ngrx/store s-ng-utils s-rxjs-utils s-js-utils micro-dash
```

## Setup

Define the shape of your application state using typescript classes or interfaces (but prefer classes, as noted in the style guide below). For example:

```ts
// state/my-state.ts

import { User } from "./user";

export class MyState {
  loading = true;
  currentUser?: User;
}
```

```ts
// state/user.ts

export class User {
  id: string;
  name: string;
}
```

Then create a subclass of `AppStore`. A single instance of that class will serve as the entry point to obtain and modify the state it holds. Most often you will make that class an Angular service that can be injected anywhere in your app. For example:

```ts
// state/my-store.service.ts

import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppStore } from "ng-app-state";
import { MyState } from "./my-state";

@Injectable()
export class MyStore extends AppStore<MyState> {
  constructor(store: Store<any>) {
    super(store, "myState", new MyState());
  }
}
```

The second argument to the constructor above, `"myState"`, must be unique for each store object you create. It becomes the top-level key of this store within the global `ngrx/store`. You can create multiple `AppStore` objects as long as each has a different key.

Below is a common setup for your root module. Note that the only required part is importing `StoreModule.forRoot()` to initialize `ngrx/store`, and passing it `ngAppStateReducer` in the list of meta reducers.

```ts
// app.module.ts

import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { ngAppStateReducer } from "ng-app-state";
import { MyStore } from "./state/my-store";

@NgModule({
  imports: [
    StoreModule.forRoot({}, { metaReducers: [ngAppStateReducer] }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
  ],
  providers: [MyStore],
})
export class AppModule {}
```

## Usage

Consider this translation of the counter example from the `ngrx/store` readme:

```ts
// counter-state.ts
export class CounterState {
  counter = 0;
}

// counter-store.ts
@Injectable()
export class CounterStore extends AppStore<CounterState> {
  constructor(store: Store<any>) {
    super(store, "counterState", new CounterState());
  }
}

// my-app-component.ts
@Component({
  selector: "my-app",
  template: `
    <button (click)="increment()">Increment</button>
    <div>Current Count: {{ counterStore.$ | async }}</div>
    <button (click)="decrement()">Decrement</button>

    <button (click)="reset()">Reset Counter</button>
  `,
})
export class MyAppComponent {
  counterStore: StoreObject<number>;

  constructor(store: CounterStore) {
    this.counterStore = store("counter");
  }

  increment() {
    this.counterStore.set(this.counterStore.state() + 1);
  }

  decrement() {
    this.counterStore.set(this.counterStore.state() - 1);
  }

  reset() {
    this.counterStore.set(0);
  }
}
```

## Compatibility with `ngrx/store`

`ng-app-state` is entirely compatible with all features of `ngrx/store`, `ngrx/store-devtools`, `ngrx/effects`, and any other libraries in the ecosystem. Both can even manage and access the same parts of the store.

## Comparison to `ngrx/store`

The main difference you'll see with `ng-app-state` is that you do not define reducers or actions (or the string constants to tie them together). For full examples:

- View the [full diff](https://github.com/simontonsoftware/ng-app-state/compare/unmodified-counter-demo...b9c72c04767cc5b9bbcc90921d80230227ffae4c) of the Counter app between `ngrx/store` and `ng-app-state`.
- For a meatier example, check out the [migrated example-app](https://github.com/simontonsoftware/ngrx-example-app-to-ng-app-state/blob/master/README.md). It shows 3 more migrations of differing complexities for each of the 3 modules in [ngrx's example-app](https://github.com/ngrx/platform/blob/master/example-app/README.md). Put together, the full diff sheds about 700 lines compared to the original.

## Style Guide

- Define your state using classes instead of interfaces, and when possible make `new StateObject()` come with the default values for all its properties.
- When possible, only use plain object in your state. State classes can have a constructor to assist when creating a new object, but avoid any other methods. This allows you to use `set()` and the other mutation methods on store objects freely (because mutating causes that object and all its ancestors to be recreated as plain objects or arrays, losing any methods defined by its prototype).
- When obtaining the current state of a nested property, prefer calling `state()` early. E.g.:
  ```ts
  store.state().currentUser.name; // do this
  store("currentUser")("name").state(); // not this
  ```
  This allows the use of `!` to easily declare the presence of an intermediate object. E.g.:
  ```ts
  store.state().currentUser!.name; // do this
  store<"currentUser", User>("currentUser")("name").state(); // not this
  ```

## UndoManager

This package includes an abstract class, `UndoManager`, to assist you in creating undo/redo functionality. For example, a simple subclass that captures every state change into the undo history:

```ts
@Injectable()
class UndoService extends UndoManager<MyAppState, MyAppState> {
  private skipNextChange = true;

  constructor(store: MyAppStore) {
    super(store);
    store.$.subscribe(() => {
      if (this.skipNextChange) {
        this.skipNextChange = false;
      } else {
        this.pushCurrentState();
      }
    });
  }

  protected extractUndoState(state: MyAppState) {
    return state;
  }

  protected applyUndoState(
    stateToApply: MyAppState,
    batch: StoreObject<MyAppState>,
  ) {
    this.skipNextChange = true;
    batch.set(stateToApply);
  }
}
```

You will likely want to be more selective about which states are pushed into the undo history, rather than subscribing to all changes. Real-world usage will be more selective about calling `pushCurrentState()`, and maybe from other places in your app instead of within the service itself.

You may also want to tailor which pieces of state are included in undo/redo operations by returning only those portions from `extractUndoState()` (which will change what is passed to `applyUndoState()`).

Consult the documentation in the source of `UndoState` for more options and information.
