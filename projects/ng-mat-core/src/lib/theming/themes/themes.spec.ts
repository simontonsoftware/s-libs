import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ComponentContext } from '@s-libs/ng-dev';
import { getStyle } from '../test-utils';

describe('themes.scss', () => {
  it('includes themes', () => {
    @Component({
      styleUrls: ['./minimal-config.spec.scss'],
      template: `<mat-toolbar></mat-toolbar>`,
    })
    class TestComponent {}

    const ctx = new ComponentContext(TestComponent, {
      imports: [MatToolbarModule],
    });
    ctx.run(async () => {
      // if this has to change, also update the test in `colors.spec.ts` which shows the height is 0px
      expect(getStyle('mat-toolbar').height).toBe('64px');
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

  it('allows specifying density', () => {
    @Component({
      styleUrls: ['./custom-density.spec.scss'],
      template: `<button mat-button></button>`,
    })
    class TestComponent {}

    const ctx = new ComponentContext(TestComponent, {
      imports: [MatButtonModule],
    });
    ctx.run(async () => {
      expect(getStyle('button').height).toBe('32px');
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

  describe('typography', () => {
    it('defaults to include typography', () => {
      @Component({
        styleUrls: ['./minimal-config.spec.scss'],
        template: `<button mat-button></button>`,
      })
      class TestComponent {}

      const ctx = new ComponentContext(TestComponent, {
        imports: [MatButtonModule],
      });
      ctx.run(async () => {
        expect(getStyle('button').fontFamily).toBe('Roboto, sans-serif');
      });
    });

    it('allows specifying typography', () => {
      @Component({
        styleUrls: ['./custom-typography.spec.scss'],
        template: `<button mat-button></button>`,
      })
      class TestComponent {}

      const ctx = new ComponentContext(TestComponent, {
        imports: [MatButtonModule],
      });
      ctx.run(async () => {
        expect(getStyle('button').fontFamily).toBe('monospace');
      });
    });

    it('allows opting out of typography', () => {
      @Component({
        styleUrls: ['./no-typography.spec.scss'],
        template: `
          <div style="font-family: Arial">
            <button mat-button></button>
          </div>
        `,
      })
      class TestComponent {}

      const ctx = new ComponentContext(TestComponent, {
        imports: [MatButtonModule],
      });
      ctx.run(async () => {
        expect(getStyle('button').fontFamily).toBe('Arial');
      });
    });
  });
});
