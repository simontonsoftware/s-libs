import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ComponentContext } from '@s-libs/ng-dev';
import { getStyle } from '../test-utils';

describe('colors.scss', () => {
  it('does not include themes', () => {
    @Component({
      styleUrls: ['./minimal-config.spec.scss'],
      template: `<mat-toolbar></mat-toolbar>`,
    })
    class TestComponent {}

    const ctx = new ComponentContext(TestComponent, {
      imports: [MatToolbarModule],
    });
    ctx.run(async () => {
      // to prove test, change minimal config to use themes instead of colors and see that the height is 64px
      expect(getStyle('mat-toolbar').height).toBe('0px');
    });
  });

  it('allows passing in a custom palette key', () => {
    @Component({
      styleUrls: ['./custom-palette-key.spec.scss'],
      template: `<mat-toolbar color="accent"></mat-toolbar>`,
    })
    class TestComponent {}

    const ctx = new ComponentContext(TestComponent, {
      imports: [MatToolbarModule],
    });
    ctx.run(async () => {
      expect(getStyle('mat-toolbar').backgroundColor).toBe('rgb(255, 152, 0)');
    });
  });

  it('allows specifying only some components', () => {
    @Component({
      styleUrls: ['./only-button.spec.scss'],
      template: `
        <button mat-button color="primary"></button>
        <mat-toolbar color="accent"></mat-toolbar>
      `,
    })
    class TestComponent {}

    const ctx = new ComponentContext(TestComponent, {
      imports: [MatButtonModule, MatToolbarModule],
    });
    ctx.run(async () => {
      expect(getStyle('button').color).toBe('rgb(3, 169, 244)');
      expect(getStyle('mat-toolbar').backgroundColor).toBe('rgba(0, 0, 0, 0)');
    });
  });
});
