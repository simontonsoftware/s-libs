import { Predicate } from '@angular/core';
import { MonoTypeOperatorFunction } from 'rxjs';
import { createOperatorFunction } from '../create-operator-function';

/**
 * Works like `filter()`, but always lets through the first emission for each new subscriber. This makes it suitable for subscribers that expect the observable to behave like a `BehaviorSubject`, where the first emission is processed synchronously during the call to `subscribe()` (such as the `async` pipe in an Angular template).
 *
 * ```
 * source:                   |-false--true--false--true--false--true-|
 * filterBehavior(identity): |-false--true---------true---------true-|
 * filterBehavior(identity):        |-true---------true---------true-|
 * filterBehavior(identity):              |-false--true---------true-|
 * ```
 */
export function filterBehavior<T>(
  predicate: Predicate<T>,
): MonoTypeOperatorFunction<T> {
  return createOperatorFunction<T>((subscriber, destination) => {
    let firstValue = true;
    subscriber.next = (value) => {
      if (firstValue) {
        destination.next(value);
        firstValue = false;
        return;
      }

      try {
        if (predicate(value)) {
          destination.next(value);
        }
      } catch (ex) {
        destination.error(ex);
      }
    };
  });
}
