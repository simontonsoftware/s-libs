import { isTruthy } from '@s-libs/js-core';
import { Observable } from 'rxjs';
import { filter, finalize, switchMap } from 'rxjs/operators';
import { isPageVisible$ } from './is-page-visible';

export interface WakeLockSentinel {
  release: () => Promise<void>;
}

export interface WakeLock {
  request: (type: 'screen') => Promise<WakeLockSentinel>;
}

export interface ExtendedNavigator {
  wakeLock?: WakeLock;
}

/**
 * Subscribe to the returned observable to acquire a [wake lock]{@link https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API}. The wake lock will be re-acquired whenever the page is visible automatically. Unsubscribe to release it.
 *
 * There are no guarantees about what or when the returned observable emits.
 */
export function keepWakeLock$(): Observable<unknown> {
  let sentinel: WakeLockSentinel | undefined;
  const nav = navigator as ExtendedNavigator;
  return isPageVisible$().pipe(
    filter(isTruthy),
    switchMap(async () => {
      try {
        sentinel = await nav.wakeLock?.request('screen');
      } catch {
        // can happen when e.g. the battery is low
      }
    }),
    finalize(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      sentinel?.release();
    }),
  );
}
