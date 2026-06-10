import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { ComponentContext } from '../component-context/component-context';

describe('FakeTimerHarnessEnvironment', () => {
  @Component({
    imports: [MatButton],
    template: `
      <button mat-button (click)="clicked = true">{{ clicked }}</button>
    `,
  })
  class ClickableButtonComponent {
    clicked = false;
  }

  it('runs asynchronous events that are due automatically', async () => {
    const ctx = new ComponentContext(ClickableButtonComponent);
    await ctx.run(async () => {
      const button = await ctx.getHarness(MatButtonHarness);
      await button.click();
      expect(await button.getText()).toBe('true');
    });
  });

  it('does not flush timeouts that are not yet due', async () => {
    const ctx = new ComponentContext(ClickableButtonComponent, {
      imports: [MatSnackBarModule],
    });
    await ctx.run(async () => {
      ctx
        .inject(MatSnackBar)
        // When using the built-in TestBedHarnessEnvironment, fetching the harness would flush the duration, and it would disappear before being selected
        .open('Hello, snackbar!', 'OK', { duration: 5000 });
      expect(await ctx.getHarness(MatSnackBarHarness)).toBeDefined();
    });
  });
});
