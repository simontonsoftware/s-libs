import { Observable, Observer, OperatorFunction, Subscriber } from 'rxjs';

/**
 * Use this to create a complex pipeable operator. It is usually better style to compose existing operators than to create a brand new one, but when you need full control this can reduce some boilerplate.
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
  DestinationType = SourceType
>(
  modifySubscriber: (
    subscriber: RequiredSubscriber<SourceType>,
    destination: Observer<DestinationType>,
  ) => void,
): OperatorFunction<SourceType, DestinationType> {
  return (source: Observable<SourceType>) =>
    new Observable<DestinationType>((destination) => {
      const subscriber = new Subscriber<SourceType>(destination);
      modifySubscriber(subscriber, destination);
      return source.subscribe(subscriber);
    });
}

/** @hidden */
interface RequiredSubscriber<T> extends Subscriber<T> {
  /**
   * `value` is optional in `Subscriber`. We need it to be required.
   */
  next(value: T): void;
}
