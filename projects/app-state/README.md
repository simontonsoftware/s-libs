An observable state management library. Think of it like Redux, but without actions or reducers. That makes it a natural fit for anyone who wants the benefits of centralized state management, without adopting a function style of programming.

## API Documentation

Once you are familiar with the basics, it may help to see the [api documentation](https://simontonsoftware.github.io/s-libs/app-state).

## Introduction

A basic idea behind this library is to keep all the state of your app in one place, accessible for any component or service to access, modify and subscribe to changes. This has several benefits:

- Components no longer need multiple inputs and outputs to route state and mutations to the proper components. Instead they can obtain the store via dependency injection.
- During debugging you can look in one place to see the state of your entire app. Moreover, development tools can be used to see this information at a glance along with a full history of changes leading up to the current state ([Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)).
- The objects in the store are immutable (as long as you only modify the state via the store, as you should), which enables more benefits:
  - Immutable objects allow you to use Angular's on-push change detection, which can be a huge performance gain for apps with a large state.
  - Undo/redo features become very simple. This library includes a helper to make it even easier (more info below).
- Every piece of state is observable. You can subscribe to the root of the store to get notified of every state change anywhere in the app, for a specific boolean buried deep within your state, or anywhere in between.

2 terms are worth defining immediately. As they are used in this library, they mean:

- **State**: a javascript object (or primitive) kept within the store. A subset of the entire application state is still considered state on its own.
- **Store**: the keeper of state. You will always interact with the state via the store, whether to access it, observe it or modify it. You can obtain store objects to represent a subset of your state as well, which are also store objects on their own.

## Installation

Install along with its peer dependencies using:

```shell script
npm install --save @s-libs/app-state @s-libs/ng-core @s-libs/rxjs-core @s-libs/js-core @s-libs/micro-dash

# OR

yarn add @s-libs/app-state @s-libs/ng-core @s-libs/rxjs-core @s-libs/js-core @s-libs/micro-dash
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

Then create a subclass of `RootStore`. A single instance of that class will serve as the entry point to obtain and modify the state it holds. Most often you will make that class an Angular service that can be injected anywhere in your app. For example:

```ts
// state/my-store.service.ts

import { Injectable } from "@angular/core";
import { RootStore } from "@s-libs/app-state";
import { MyState } from "./my-state";

@Injectable({ providedIn: "root" })
export class MyStore extends RootStore<MyState> {
  constructor() {
    super(new MyState());
  }
}
```

## Usage

Consider this translation of the counter example from the `ngrx/store` readme:

```ts
// app-state.ts
export class AppState {
  counter = 0;
}

// app-store.ts
@Injectable({ providedIn: "root" })
export class AppStore extends RootStore<AppState> {
  constructor() {
    super(new AppState());
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

  constructor(store: AppStore) {
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

## Upgrading from the non-S-Libs version

If you are upgrading from the loose version of [`ng-app-state`](https://github.com/simontonsoftware/ng-app-state), there are a number of changes to be aware of. App state no longer depends on `@ngrx/store`. Among other changes, it is now a standalone library, depending only on other packages in S-Libs. There are also some exciting performance improvements. In the end, you'll need to make these changes: - Remove `@ngrx/store` and `@ngrx/store-devtools` from your project, unless you are using them outside of `app-state`.

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
- Batches are no longer tied to a specific slice of the store, but always operate on the entire `RootStore`. Therefore the callback to `batch()` no longer receives a `Store` object and `.inBatch()` has been removed. Instead, operate on the store using any existing store object and it will automatically be included in the batch.
