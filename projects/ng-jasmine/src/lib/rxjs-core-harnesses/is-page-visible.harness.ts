import { AngularContext } from '../angular-context';

/**
 * Use to control {@link isPageVisible$()} in tests. Create only one per test before anything calls `isPageVisible$()`.
 *
 * ```ts
 * const isPageVisibleHarness = new IsPageVisibleHarness();
 * isPageVisibleHarness.setVisible(false);
 *
 * const next = jasmine.createSpy();
 * isPageVisible$().subscribe(next);
 * expect(next).toHaveBeenCalledWith(false);
 *
 * isPageVisibleHarness.setVisible(true);
 * expect(next).toHaveBeenCalledWith(true);
 * ```
 *
 * It also stubs `document.visibilityState` to match.
 * ```ts
 * const isPageVisibleHarness = new IsPageVisibleHarness();
 * expect(document.visibilityState).toBe('visible');
 *
 * isPageVisibleHarness.setVisible(false);
 * expect(document.visibilityState).toBe('hidden');
 * ```
 */
export class IsPageVisibleHarness {
  #visibilityState: jasmine.Spy;
  #listeners: VoidFunction[] = [];

  constructor() {
    this.#visibilityState = spyOnProperty(
      document,
      'visibilityState',
    ).and.returnValue('visible');

    spyOn(document, 'addEventListener')
      .and.callThrough()
      .withArgs('visibilitychange', jasmine.anything(), undefined)
      .and.callFake(
        (_: string, handler: EventListenerOrEventListenerObject) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- we know that `isPageVisible$()` will only call this with a function
          this.#listeners.push(handler as VoidFunction);
        },
      );
  }

  /**
   * Sets the page's visibility state, and triggers any subscriptions to `isPageVisible$()`. Automatically triggers change detection if running with an {@linkcode AngularContext}.
   */
  setVisible(visible: boolean): void {
    this.#visibilityState.and.returnValue(visible ? 'visible' : 'hidden');
    for (const listener of this.#listeners) {
      listener();
    }
    AngularContext.getCurrent()?.tick();
  }
}
