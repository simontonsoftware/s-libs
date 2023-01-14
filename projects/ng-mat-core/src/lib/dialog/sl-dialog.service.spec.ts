import { Component } from '@angular/core';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { assert } from '@s-libs/js-core';
import { AngularContext } from '@s-libs/ng-dev';
import { DialogData } from './dialog.component';
import { SlDialogModule } from './sl-dialog.module';
import { SlDialogService } from './sl-dialog.service';

describe('SlDialogService', () => {
  let ctx: AngularContext;
  beforeEach(() => {
    ctx = new AngularContext({
      imports: [SlDialogModule, NoopAnimationsModule],
    });
  });

  async function show<T>(data: DialogData<T>): Promise<T | undefined> {
    const promise = ctx.inject(SlDialogService).open(data);
    ctx.tick();
    return promise;
  }

  it('does not autoscroll down to a focusable element', () => {
    @Component({
      template: `
        <div style="height: 150vh"></div>
        <a href>Link</a>
      `,
    })
    class DefinitelyScrollableDialogComponent {}

    ctx.run(async () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      show({ component: DefinitelyScrollableDialogComponent });

      // I couldn't find a way to test the scroll position through a harness
      const content = document.querySelector('mat-dialog-content');
      assert(content);
      expect(content.scrollTop).toBe(0);
    });
  });

  it('resolves to undefined when the dialog is dismissed', () => {
    ctx.run(async () => {
      const promise = show({ buttons: [{ text: 'hi', value: 'defined' }] });
      const dialog = await ctx.getHarness(MatDialogHarness);

      await dialog.close();

      expect(await promise).toBe(undefined);
    });
  });
});
