import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ComponentContext } from '@s-libs/ng-dev';
import { getStyle } from '../test-utils';

describe('colors.scss', () => {
  it('does not include themes', () => {
    @Component({
      imports: [MatButtonModule],
      template: `<button mat-button>Clickity click</button>`,
      styleUrl: './minimal-config.spec.scss',
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
      imports: [MatToolbarModule],
      template: `<mat-toolbar color="accent" />`,
      styleUrl: './custom-palette-key.spec.scss',
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
      imports: [MatButtonModule, MatToolbarModule],
      template: `
        <button mat-button color="primary">👋</button>
        <mat-toolbar color="accent" />
      `,
      styleUrl: './only-button.spec.scss',
    })
    class TestComponent {}

    const ctx = new ComponentContext(TestComponent);
    ctx.run(async () => {
      expect(getStyle('button').color).toBe('rgb(3, 169, 244)');
      expect(getStyle('mat-toolbar').backgroundColor).toBe('rgba(0, 0, 0, 0)');
    });
  });
});
