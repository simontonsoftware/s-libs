An observable state management library. Directly read, write, and observe any part of your state without writing any selectors, actions, or reducers.

## API Documentation

Once you are familiar with the basics, it may help to see the [api documentation](https://simontonsoftware.github.io/s-libs/app-state).

## Introduction

A basic idea behind this library is to keep all the state of your app in one place, accessible for any component or service to access, modify and subscribe to changes. This has several benefits:

- Components no longer need multiple inputs and outputs to route state and mutations to the proper components. Instead they can obtain the store via dependency injection.
- During debugging, you can look in one place to see the state of your entire app. Moreover, development tools can be used to see this information at a glance along with a full history of changes leading up to the current state ([Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)).
- The objects in the store are immutable (as long as you only modify the state via the store, as you should), which enables more benefits:
  - Immutable objects allow efficient comparison using `===` to determine if they changed. Note that if you are using Angular this enables on-push change detection, but you should consider the newer [`signal-store`](https://github.com/simontonsoftware/s-libs/tree/master/projects/signal-store) instead!
  - Undo/redo features become very simple. This library includes a helper to make it even easier (more info below).
- Every piece of state is observable. You can subscribe to the root of the store to get notified of every state change anywhere in the app, a specific boolean buried deep within your state, or anywhere in between.

2 terms are worth defining immediately. As they are used in this library, they mean:

- **State**: a javascript object (or primitive) kept within the store. A subset of the entire application state is still considered state on its own.
- **Store**: the keeper of state. You will always interact with the state via the store, whether to access it, observe it or modify it. You can obtain store objects to represent a subset of your state as well, which are also store objects on their own.

## Installation

Install along with its peer dependencies using:

```shell script
npm install @s-libs/app-state @s-libs/ng-core @s-libs/rxjs-core @s-libs/js-core @s-libs/micro-dash
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

Then create a subclass of `RootStore`. A single instance of that class will serve as the entry point to obtain and modify the state it holds.

```ts
// state/my-store.ts

import { RootStore } from "@s-libs/app-state";
import { MyState } from "./my-state";

export class MyStore extends RootStore<MyState> {
  constructor() {
    super(new MyState());
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

  protected applyUndoState(stateToApply: MyAppState) {
    this.skipNextChange = true;
    this.store.set(stateToApply);
  }
}
```

You will likely want to be more selective about which states are pushed into the undo history, rather than subscribing to all changes. Real-world usage will be more selective about calling `pushCurrentState()`, and maybe from other places in your app instead of within the service itself.

You may also want to tailor which pieces of state are included in undo/redo operations by returning only those portions from `extractUndoState()` (which will change what is passed to `applyUndoState()`).

Consult the documentation in the source of `UndoState` for more options and information.
