import { fromEvent, Observable } from 'rxjs';
import { filter, finalize, startWith, switchMap } from 'rxjs/operators';

/** @hidden */
export interface WakeLockSentinel {
  release(): Promise<void>;
}

/** @hidden */
export interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>;
}

/** @hidden */
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
  return fromEvent(document, 'visibilitychange').pipe(
    startWith(0),
    filter(() => document.visibilityState === 'visible'),
    switchMap(async () => {
      try {
        sentinel = await nav.wakeLock?.request('screen');
      } catch {
        // can happen when e.g. the battery is low
      }
    }),
    finalize(() => {
      sentinel?.release();
    }),
  );
}
