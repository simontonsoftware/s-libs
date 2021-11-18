import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RootStore } from '@s-libs/app-state';
import { NasModelModule } from '@s-libs/ng-app-state';
import { ComponentContext } from '@s-libs/ng-dev';
import { WrappedControlComponent } from './wrapped-control.component';

describe('WrappedControlComponent', () => {
  // There is some kind of tricky timing issue when using NasModel and WrappedControlSuperclass that required moving a subscription from `ngOnInit()` to `constructor()` to fix.
  it('catches the first incoming value from a nasModel', () => {
    @Component({
      template: `
        <sl-wrapped-control [nasModel]="store('value')"></sl-wrapped-control>
      `,
    })
    class WrapperComponent {
      store = new RootStore({ value: 'initial value' });
    }

    const ctx = new ComponentContext(WrapperComponent, {
      declarations: [WrappedControlComponent],
      imports: [FormsModule, NasModelModule, ReactiveFormsModule],
    });
    ctx.run(() => {
      const el: HTMLElement = ctx.fixture.nativeElement;
      const input = el.querySelector('input')!;
      expect(input.value).toBe('initial value');
    });
  });
});
