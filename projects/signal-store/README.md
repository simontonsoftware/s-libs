A state management library build on Angular signals. An API inspired by [`app-state`](https://github.com/simontonsoftware/s-libs/tree/master/projects/app-state) allows you to directly read, write and observe any part of your state without writing any selectors, actions, or reducers. Directly bind any part of the store using `[(ngModel)]`.

## API Documentation

Once you are familiar with the basics, definitely check out the [api documentation](https://simontonsoftware.github.io/s-libs/signal-store) to find more details and utilities.

## Introduction

A basic idea behind this library is to keep all the state of your app in one place, accessible for any component or service to access, modify and subscribe to changes. This has several benefits:

- Components no longer need multiple inputs and outputs to route state and mutations to the proper components. Instead, they can obtain the store via dependency injection.
- During debugging, you can look in one place to see the state of your entire app. Moreover, development tools can be used to see this information at a glance along with a full history of changes leading up to the current state ([Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)).
- The objects in the store are immutable (as long as you only modify the state via the store, as you should), which enables more benefits:
  - Immutable objects allow you to use on-push change detection, which can be a huge performance gain for apps with a large state.
  - Undo/redo features become very simple. Check the API docs for a helper.
- Every piece of state is observable. You can subscribe to the root of the store to get notified of every state change anywhere in the app, for a specific boolean buried deep within your state, or anywhere in between.

2 terms are worth defining immediately. As they are used in this library, they mean:

- **State**: a javascript object (or primitive) kept within the store. A subset of the entire application state is still considered state on its own.
- **Store**: the keeper of state. You will always interact with the state via the store, whether to access it, observe it or modify it. You can obtain store objects to represent a subset of your state as well, which are also store objects on their own.

## Installation

Install along with its peer dependencies using:

```shell script
npm install @s-libs/signal-store @s-libs/js-core @s-libs/micro-dash
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
// state/my-store.ts

import { Injectable } from "@angular/core";
import { RootStore } from "@s-libs/signal-store";
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
class AppState {
  counter = 0;
}

// app-store.ts
@Injectable({ providedIn: "root" })
class AppStore extends RootStore<AppState> {
  constructor() {
    super(new AppState());
  }
}

// my-app-component.ts
@Component({
  selector: "sl-my-app",
  template: `
    <button (click)="counter.state = counter.state + 1">Increment</button>
    <div>Current Count: {{ counter.state }}</div>
    <button (click)="counter.state = counter.state - 1">Decrement</button>

    <button (click)="counter.state = 0">Reset Counter</button>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MyAppComponent {
  protected counter = inject(AppStore)("counter");
}
```

## Style Guide

- Define your state using classes instead of interfaces, and when possible make `new StateObject()` come with the default values for all its properties.
- When possible, only use plain object in your state. State classes can have a constructor to assist when creating a new object, but avoid any other methods. This allows you to set properties on it and use other mutation methods freely. Mutating causes that object and all its ancestors to be recreated as plain objects or arrays, losing any methods defined by its prototype.
- When obtaining the current state of a nested property, prefer using `.state` at the end of the chain. E.g.:
  ```ts
  store("currentUser")("name").state; // do this
  store.state.currentUser.name; // not this
  ```
  This allows usage inside templates and effects to be marked dirty less often. When using `.state` any change at the level of the store or lower will mark it dirty, so delaying the use of `.state` until a leaf node in your state will trigger it less often.
