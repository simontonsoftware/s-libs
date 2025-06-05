import { Observable, Observer, OperatorFunction, Subscription } from 'rxjs';

/**
 * Use this to create a complex pipeable operator. It is usually a better style to compose existing operators than to create a brand new one, but when you need full control, this can reduce some boilerplate.
 *
 * The supplied `subscriber` will act as a simple pass-through of all values, errors, and completion to `destination`. Modify it for your needs.
 *
 * A simple example, recreating the "map" operator:
 * ```ts
 * function map<I, O>(fn: (input: I) => O) {
 *   return createOperatorFunction<I, O>(
 *     (subscriber, destination) => {
 *       subscriber.next = (value) => {
 *         destination.next(fn(value));
 *       };
 *     },
 *   );
 * }
 * ```
 *
 * For a more complex example, check the source of `skipAfter`.
 */
export function createOperatorFunction<
  SourceType,
  DestinationType = SourceType,
>(
  modifySubscriber: (
    subscriber: SubscriberCompat<SourceType>,
    destination: Observer<DestinationType>,
  ) => void,
): OperatorFunction<SourceType, DestinationType> {
  return (source: Observable<SourceType>): Observable<DestinationType> =>
    new Observable<DestinationType>((destination) => {
      const subscriber = new SubscriberCompat<SourceType>(
        destination as Observer<any>,
      );
      modifySubscriber(subscriber, destination);
      return source.subscribe(subscriber);
    });
}

/**
 * RxJS deprecated all the ways to create their `Subscriber` class. This recreates the parts of its functionality we surfaced.
 */
export class SubscriberCompat<T> extends Subscription implements Observer<T> {
  constructor(private destination: Observer<unknown>) {
    super();
  }

  next(value: T): void {
    this.destination.next(value);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- just following the `Observer` interface
  error(err: any): void {
    try {
      this.destination.error(err);
    } finally {
      this.unsubscribe();
    }
  }

  complete(): void {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  }
}
