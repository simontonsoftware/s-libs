import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { ComponentContext } from '@s-libs/ng-dev';
import { provideMatIcons } from './provide-mat-icons';

describe('provideMatIcons()', () => {
  it('works', () => {
    const icons = '<svg id="my_icon"><rect /></svg>';

    @Component({
      imports: [MatIconModule],
      template: '<mat-icon svgIcon="my_icon" />',
    })
    class TestComponent {}

    const ctx = new ComponentContext(TestComponent, {
      providers: [provideMatIcons(icons)],
    });
    ctx.run(async () => {
      expect(ctx.fixture.debugElement.query(By.css('rect'))).toBeTruthy();
    });
  });
});
