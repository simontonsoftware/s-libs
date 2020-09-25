import { asapScheduler, MonoTypeOperatorFunction } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Delays the emission of items from the source Observable using the microtask queue.
 */
export function delayOnMicrotaskQueue<T>(): MonoTypeOperatorFunction<T> {
  return delay<T>(0, asapScheduler);
}
