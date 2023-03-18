import { InjectionToken, Provider } from '@angular/core';
import { LazyBundle, LazyLoader } from './lazy-loader';

/**
 * Use when configuring tests for code that uses a {@link LazyLoader}.
 *
 * Angular tests that use {@link waitForAsync} or {@link fakeAsync} depend on Zone.js to know when asynchronous actions are pending and when they complete. Zone is not aware of the dynamic imports used for lazy loading, so you can use this helper during test setup to work around the issue.
 *
 * ```ts
 * // if you have followed the pattern from LazyLoader docs and created
 * // both a bundle and token, import the bundle directly into your test file
 * import snackBarBundle from './snack-bar-bundle';
 * import { snackBarLoaderToken } from './snack-bar-loader-token';
 *
 * // add to the constructor of AngularContext or ComponentContext
 * const ctx = new AngularContext({
 *   providers: [provideEagerLoading(snackBarLoaderToken, snackBarBundle)],
 * });
 *
 * // or if using TestBed directly, add to configureTestingModule
 * TestBed.configureTestingModule({
 *   providers: [provideEagerLoading(snackBarLoaderToken, snackBarBundle)],
 * });
 * ```
 */
export function provideEagerLoading(
  token: InjectionToken<LazyLoader<LazyBundle>>,
  bundle: LazyBundle,
): Provider {
  return {
    provide: token,
    useFactory: (): LazyLoader<LazyBundle> =>
      new LazyLoader(Promise.resolve({ default: bundle })),
  };
}
