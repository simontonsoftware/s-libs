import { MonoTypeOperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logs values, errors and completion to the console, and passes them all along unchanged.
 *
 * ```ts
 * of(1, 2).pipe(logValues()).subscribe();
 * // prints using console.log:
 * // [value] 1
 * // [value] 2
 * // [complete]
 *
 * of(1, 2).pipe(logValues("my number", "debug")).subscribe();
 * // prints using console.debug:
 * // [value] my number 1
 * // [value] my number 2
 * // [complete] my number
 *
 * throwError("boo").pipe(logValues("pipe says", "warn")).subscribe();
 * // prints using console.warn:
 * // [error] pipe says boo
 * ```
 */
export function logValues<T>(
  prefix?: string,
  level: 'debug' | 'trace' | 'info' | 'log' | 'warn' | 'error' = 'log',
): MonoTypeOperatorFunction<T> {
  return tap<T>(
    makeLogFn('[value]'),
    makeLogFn('[error]'),
    makeLogFn('[complete]'),
  );

  function makeLogFn(...prefixes: string[]): (value?: any) => void {
    if (prefix !== undefined) {
      prefixes.push(prefix);
    }
    return (...values: any[]) => {
      console[level](...prefixes, ...values);
    };
  }
}
