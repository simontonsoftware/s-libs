import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentContext } from '@s-libs/ng-dev';

describe('full-theming()', () => {
  it('works for the minimal example in the docs', () => {
    @Component({
      standalone: true,
      styleUrls: ['./minimal-example-from-docs.spec.scss'],
      template: '<div class="mat-app-background"></div>',
    })
    class TestComponent {}

    const ctx = new ComponentContext(TestComponent);
    ctx.run(async () => {
      const el = ctx.fixture.debugElement.query(
        By.css('.mat-app-background'),
      ).nativeElement;

      // we don't know if the browser will be running in light or dark theme, so expect either one
      expect(['rgb(250, 250, 250)', 'rgb(48, 48, 48)']).toContain(
        getComputedStyle(el).backgroundColor,
      );
    });
  });
});
