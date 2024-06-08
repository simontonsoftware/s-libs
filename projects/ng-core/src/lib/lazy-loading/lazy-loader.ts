import {
  createEnvironmentInjector,
  EnvironmentInjector,
  EnvironmentProviders,
  inject,
  Injector,
  Provider,
  ProviderToken,
} from '@angular/core';

export interface LazyBundle {
  tokenMap: Record<string, ProviderToken<any>>;
  providers?: Array<EnvironmentProviders | Provider>;
}

type LazyImport<B extends LazyBundle> = Promise<{ default: B }>;
type TokenMapOf<B extends LazyBundle> = B['tokenMap'];
type KeysOf<B extends LazyBundle> = keyof TokenMapOf<B>;
type TokenOf<B extends LazyBundle, K extends KeysOf<B>> = TokenMapOf<B>[K];
type InjectableOf<B extends LazyBundle, K extends KeysOf<B>> =
  TokenOf<B, K> extends ProviderToken<infer I> ? I : never;

/**
 * A helper to lazy-load Angular services that are not associated with a lazy route. For example, you can split snack bar code into a separate bundle like this:
 *
 * ```ts
 * // snack-bar-bundle.ts
 * export const snackBarBundle = {
 *   tokenMap: { MatSnackBar },
 *   providers: [importProvidersFrom(MatSnackBarModule)],
 * };
 * export type SnackBarBundle = typeof snackBarBundle;
 * export default snackBarBundle;
 *
 * // snack-bar-loader-token.ts
 * export const snackBarLoaderToken = new InjectionToken('snack bar loader', {
 *   factory: (): LazyLoader<SnackBarBundle> =>
 *     new LazyLoader(import('./snack-bar-bundle'))
 * });
 *
 * // my-component.ts
 * @Component({
 *   template: `<button (click)=showSnackBar()>Click me</button>`
 * })
 * class MyComponent {
 *   #snackBarLoader = inject(snackBarLoaderToken);
 *
 *   async showSnackBar(): Promise<void> {
 *     const matSnackBar = await this.#snackBarLoader.inject('MatSnackBar');
 *     matSnackBar.open('You clicked the button');
 *   }
 * }
 * ```
 *
 * Angular tests don't play well with lazy loading, so be sure to check out {@link provideEagerLoading}.
 */
export class LazyLoader<B extends LazyBundle> {
  #resolvedBundle: Promise<{ injector: Injector; tokenMap: TokenMapOf<B> }>;

  /**
   * This must be created in the context of an environment injector (e.g. during construction of a service or component).
   */
  constructor(bundleImport: LazyImport<B>) {
    const injector = inject(EnvironmentInjector);
    this.#resolvedBundle = bundleImport.then((module) => ({
      injector: createEnvironmentInjector(
        module.default.providers ?? [],
        injector,
      ),
      tokenMap: module.default.tokenMap,
    }));
  }

  /**
   * Gets an injectable (e.g. a service) from the lazy bundle.
   */
  async inject<K extends KeysOf<B>>(key: K): Promise<InjectableOf<B, K>> {
    const { injector, tokenMap } = await this.#resolvedBundle;
    return injector.get<InjectableOf<B, K>>(tokenMap[key]);
  }

  /**
   * Gets a provider token from the lazy bundle. This can be useful e.g. when creating a component dynamically, such as for a Material dialog:
   *
   * ```ts
   * // my-dialog.ts
   * @Component({
   *   template: `
   *     <mat-dialog-content>This is a dialog</mat-dialog-content>
   *     <mat-dialog-actions>
   *       <button mat-button mat-dialog-close>OK</button>
   *     </mat-dialog-actions>
   *   `,
   *   standalone: true,
   *   imports: [MatButtonModule, MatDialogModule],
   * })
   * export class MyDialogComponent {}
   *
   * // dialog-bundle.ts
   * export const dialogBundle = {
   *   tokenMap: { MatDialog, MyDialogComponent },
   *   providers: [importProvidersFrom(MatDialogModule)],
   * };
   * export type DialogBundle = typeof dialogBundle;
   * export default dialogBundle;
   *
   * // dialog-loader-token.ts
   * export const dialogLoaderToken = new InjectionToken('dialog loader', {
   *   factory: () => LazyLoader<DialogBundle> =>
   *     new LazyLoader(import('./dialog-bundle'))
   * });
   *
   * // wherever you want to open the dialog
   * const dialogLoader = inject(dialogLoaderToken);
   * const matDialog = await dialogLoader.inject('MatDialog');
   * const myDialogComponent = await dialogLoader.getToken('MyDialogComponent');
   * matDialog.open(myDialogComponent);
   * ```
   */
  async getToken<K extends KeysOf<B>>(key: K): Promise<TokenOf<B, K>> {
    const { tokenMap } = await this.#resolvedBundle;
    return tokenMap[key];
  }
}
