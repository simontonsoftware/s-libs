import { effect, EffectRef, Signal } from '@angular/core';

/**
 * Calls `handle` with the latest value from `input` as it emits, ensuring that only one call is in flight at a time. If multiple values are emitted while a call is in flight, only the latest value will be handled after the current call completes.
 *
 * ```ts
 * const input = signal(0);
 * debounceWhileHandling(input, async (value) => {
 *   console.log("handling:", value);
 *   await sleep(1_000);
 *   console.log("handled:", value);
 * });
 *
 * // "handling: 0"
 * input.set(1);
 * input.set(2);
 * await sleep(1_000);
 * // "handled: 0"
 * // "handling: 2"
 * ```
 *
 * @returns An `EffectRef` that stops handling, including any queued calls. A handle call that is already in flight will not be affected.
 */
export function debounceWhileHandling<T>(
  input: Signal<T>,
  handle: (value: T) => Promise<void>,
): EffectRef {
  let nextValue: T;
  let inFlight = false;
  let queued = false;
  return effect(() => {
    nextValue = input();
    if (inFlight) {
      queued = true;
    } else {
      doIt();
    }
  });

  function doIt(): void {
    inFlight = true;
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- because this is library code, we'll leave it to the user to collect this error (probably with `provideBrowserGlobalErrorListeners`)
    handle(nextValue).finally(() => {
      inFlight = false;
      if (queued) {
        queued = false;
        doIt();
      }
    });
  }
}
