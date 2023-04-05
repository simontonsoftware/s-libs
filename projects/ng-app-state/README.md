Painlessly integrate [`app-state`](https://github.com/simontonsoftware/s-libs/projects/app-state) into template-driven Angular forms.

## Installation

Install along with its peer dependencies using:

```shell script
npm install @s-libs/ng-app-state @s-libs/app-state @s-libs/ng-core @s-libs/rxjs-core @s-libs/js-core @s-libs/micro-dash
```

## Setup

In your module, import `NasModelModule`, e.g.:

```ts
// app.module.ts

import { NasModelModule } from "@s-libs/ng-app-state";

@NgModule({
  imports: [NasModelModule],
})
export class AppModule {}
```

## Template Driven Forms

This library includes the `[nasModel]` directive that you can use in place of `[(ngModel)]` to bind form controls directly to store objects. For example, to edit the current user's name in the example above:

```ts
@Component({
  template: `<input [nasModel]="nameStore" />`,
})
class AccountSettingsComponent {
  nameStore: Store<string>;

  constructor(myStore: MyStore) {
    this.nameStore = myStore("currentUser")("name");
  }
}
```

`[nasModel]` is tested to work with all standard form controls. Except where noted, they all bind to `Store<string>` objects.

- `<input type="checkbox">` - binds to `Store<boolean>`
- `<input type="color">`
- `<input type="date">`
- `<input type="datetime-local">`
- `<input type="email">`
- `<input type="month">`
- `<input type="number">` - binds to `Store<number>`
- `<input type="password">`
- `<input type="radio">`
- `<input type="range">` - binds to `Store<number>`
- `<input type="search">`
- `<input type="tel">`
- `<input type="text">`
- `<input type="time">`
- `<input type="url">`
- `<input type="week">`
- `<input>`
- `<select multiple>` - binds to `Store<string[]>`
- `<select>`
- `<textarea>`
