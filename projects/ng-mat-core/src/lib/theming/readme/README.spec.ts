import { Component, ViewEncapsulation } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentContext } from '@s-libs/ng-dev';

describe('README', () => {
  it('has a working minimal example', () => {
    @Component({
      standalone: true,
      styleUrl: './minimal-example.scss',
      template: '<div class="mat-app-background"></div>',

      // needed because the example uses `theming.full()`, which sets its styles on `:root`
      encapsulation: ViewEncapsulation.None,
    })
    class TestComponent {}

    const ctx = new ComponentContext(TestComponent);
    ctx.run(async () => {
      const el = ctx.fixture.debugElement.query(
        By.css('.mat-app-background'),
      ).nativeElement;

      // we don't know if the browser will be running in light or dark theme, so expect either one
      expect(['rgb(255, 251, 255)', 'rgb(27, 27, 31)']).toContain(
        getComputedStyle(el).backgroundColor,
      );
    });
  });
});
