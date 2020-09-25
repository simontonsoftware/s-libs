import {
  MonoTypeOperatorFunction,
  Observable,
  ReplaySubject,
  Subscription,
} from 'rxjs';

/**
 * 1. Caches the last value emitted to give to new subscribers (without running any upstream pipe operators)
 * 2. Manages all subscribers directly, without passing subscriptions up the stream.
 *
 * This is very similar to `shareReplay(1)`, except that once all subscribers unsubscribe this also unsubscribes from the upstream observable.
 *
 * ```ts
 * const source = new BehaviorSubject(1000);
 * const result = source.pipe(expensiveComputation(), cache());
 * source.subscribe(); // expensiveComputation(1000) runs
 * source.subscribe(); // the cached result is used
 * source.next(2000); // expensiveComputation(2000) runs once, emitted to both subscribers
 * ```
 */
export function cache<T>(): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => {
    let middleMan: ReplaySubject<T> | undefined;
    let upstreamSubscription: Subscription;
    return new Observable<T>((subscriber) => {
      if (!middleMan) {
        middleMan = new ReplaySubject<T>(1);
        upstreamSubscription = source.subscribe(middleMan);
      }

      const subscription = middleMan.subscribe(subscriber);

      // teardown logic
      return () => {
        subscription.unsubscribe();
        if (middleMan!.observers.length === 0) {
          upstreamSubscription.unsubscribe();
          middleMan = undefined;
        }
      };
    });
  };
}
