import {
  Component,
  importProvidersFrom,
  Injectable,
  InjectionToken,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { AngularContext, staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { LazyLoader } from './lazy-loader';
import { provideEagerLoading } from './provide-eager-loading';

describe('LazyLoader', () => {
  it('has fancy typing', () => {
    staticTest(() => {
      @Injectable()
      class LazyService {}
      const bundle = { tokenMap: { LazyService } };
      const loader = new LazyLoader(Promise.resolve({ default: bundle }));
      expectTypeOf(loader.inject).parameter(0).toEqualTypeOf<'LazyService'>();
      expectTypeOf(loader.getToken).parameter(0).toEqualTypeOf<'LazyService'>();
    });
  });

  it('can inject from the bundle', () => {
    @Injectable()
    class LazyService {}
    const bundle = {
      tokenMap: { LazyService },
      providers: [LazyService],
    };
    const loaderToken = new InjectionToken<LazyLoader<typeof bundle>>('');
    const ctx = new AngularContext({
      providers: [provideEagerLoading(loaderToken, bundle)],
    });
    ctx.run(async () => {
      const loader = ctx.inject(loaderToken);
      expect(await loader.inject('LazyService')).toBeInstanceOf(LazyService);
    });
  });

  describe('.getToken()', () => {
    it('works', () => {
      @Injectable()
      class LazyService {}
      const bundle = { tokenMap: { LazyService } };
      const loaderToken = new InjectionToken<LazyLoader<typeof bundle>>('');
      const ctx = new AngularContext({
        providers: [provideEagerLoading(loaderToken, bundle)],
      });
      ctx.run(async () => {
        const loader = ctx.inject(loaderToken);
        expect(await loader.getToken('LazyService')).toBe(LazyService);
      });
    });

    it('works for the example in the docs', () => {
      // my-dialog.ts
      @Component({
        template: `
          <mat-dialog-content>This is a dialog</mat-dialog-content>
          <mat-dialog-actions>
            <button mat-button mat-dialog-close>OK</button>
          </mat-dialog-actions>
        `,
        standalone: true,
        imports: [MatButtonModule, MatDialogModule],
      })
      class MyDialogComponent {}

      // dialog-bundle.ts
      const dialogBundle = {
        tokenMap: { MatDialog, MyDialogComponent },
        providers: [importProvidersFrom(MatDialogModule)],
      };
      type DialogBundle = typeof dialogBundle;

      // dialog-loader-token.ts
      const dialogLoaderToken = new InjectionToken<LazyLoader<DialogBundle>>(
        'dialog loader',
      );

      const ctx = new AngularContext({
        providers: [provideEagerLoading(dialogLoaderToken, dialogBundle)],
      });
      ctx.run(async () => {
        // wherever you want to open the dialog
        const dialogLoader = ctx.inject(dialogLoaderToken);
        const matDialog = await dialogLoader.inject('MatDialog');
        const myDialogComponent =
          await dialogLoader.getToken('MyDialogComponent');
        matDialog.open(myDialogComponent);

        const dialog = await ctx.getHarness(MatDialogHarness);
        expect(await dialog.getActionsText()).toBe('OK');
      });
    });
  });
});
