import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ComponentContext } from '@s-libs/ng-dev';
import { getStyle } from '../test-utils';

describe('colors.scss', () => {
  it('does not include themes', () => {
    @Component({
      standalone: true,
      imports: [MatButtonModule],
      styleUrl: './minimal-config.spec.scss',
      template: `<button mat-button>Clickity click</button>`,
    })
    class TestComponent {}

    const ctx = new ComponentContext(TestComponent);
    ctx.run(async () => {
      // if you change this, also change `theme.spec.ts` to show the opposite
      expect(getStyle('button').fontFamily).not.toContain('Roboto');
    });
  });

  it('allows passing in a custom palette key', () => {
    @Component({
      standalone: true,
      imports: [MatToolbarModule],
      styleUrl: './custom-palette-key.spec.scss',
      template: `<mat-toolbar color="accent" />`,
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
      standalone: true,
      imports: [MatButtonModule, MatToolbarModule],
      styleUrl: './only-button.spec.scss',
      template: `
        <button mat-button color="primary"></button>
        <mat-toolbar color="accent"></mat-toolbar>
      `,
    })
    class TestComponent {}

    const ctx = new ComponentContext(TestComponent);
    ctx.run(async () => {
      expect(getStyle('button').color).toBe('rgb(3, 169, 244)');
      expect(getStyle('mat-toolbar').backgroundColor).toBe('rgba(0, 0, 0, 0)');
    });
  });
});
