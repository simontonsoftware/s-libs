import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentContextNext } from '../component-context';

@Component({
  template: `
    <button mat-button (click)="clicked = true">{{ clicked }}</button>
  `,
})
class TestComponent {
  clicked = false;
}

describe('FakeAsyncHarnessEnvironmentNext', () => {
  it('runs asynchronous events that are due automatically', () => {
    const ctx = new ComponentContextNext(TestComponent);
    ctx.run(async () => {
      const button = await ctx.getHarness(MatButtonHarness);
      await button.click();
      expect(await button.getText()).toBe('true');
    });
  });

  it('does not flush timeouts that are not yet due', () => {
    class SnackBarContext extends ComponentContextNext<TestComponent> {
      constructor() {
        super(TestComponent, {
          imports: [MatSnackBarModule, NoopAnimationsModule],
        });
      }

      protected cleanUp(): void {
        this.inject(OverlayContainer).ngOnDestroy();
        this.tick(5000);
        super.cleanUp();
      }
    }

    const ctx = new SnackBarContext();
    ctx.run(async () => {
      ctx
        .inject(MatSnackBar)
        // When using the built-in TestBedHarnessEnvironment, fetching the harness would flush the duration and it would disappear before being selected
        .open('Hello, snackbar!', 'OK', { duration: 5000 });
      expect(await ctx.getHarness(MatSnackBarHarness)).toBeDefined();
    });
  });
});
