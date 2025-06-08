import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injectable,
} from '@angular/core';
import { ComponentContext } from '@s-libs/ng-dev';
import { RootStore } from '../lib/root-store';

describe('Readme code', () => {
  it('works for counter app', () => {
    // app-state.ts
    class AppState {
      counter = 0;
    }

    // app-store.ts
    @Injectable({ providedIn: 'root' })
    class AppStore extends RootStore<AppState> {
      constructor() {
        super(new AppState());
      }
    }

    // my-app-component.ts
    @Component({
      selector: 'sl-my-app',
      standalone: true,
      template: `
        <button (click)="counter.state = counter.state + 1">Increment</button>
        <div>Current Count: {{ counter.state }}</div>
        <button (click)="counter.state = counter.state - 1">Decrement</button>

        <button (click)="counter.state = 0">Reset Counter</button>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class MyAppComponent {
      protected counter = inject(AppStore)('counter');
    }

    // ^^ example is above here

    const ctx = new ComponentContext(MyAppComponent);
    ctx.run(async () => {
      expectCount(0);

      const buttons = ctx.fixture.nativeElement.querySelectorAll('button');
      buttons[0].click();
      expectCount(1);

      buttons[1].click();
      buttons[1].click();
      expectCount(-1);

      buttons[2].click();
      expectCount(0);
    });

    function expectCount(count: number): void {
      ctx.tick();
      expect(ctx.fixture.nativeElement.textContent).toContain(
        `Current Count: ${count}`,
      );
    }
  });
});
