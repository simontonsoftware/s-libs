import { Constructor } from '@s-libs/js-core';
import { Observable, Subscription, Unsubscribable } from 'rxjs';

/**
 * Mixes in {@link SubscriptionManager} as an additional superclass.
 *
 * ```ts
 * class MySubclass extends mixInSubscriptionManager(MyOtherSuperclass) {
 *   subscribeAndManage(observable: Observable<any>) {
 *     this.subscribeTo(observable);
 *   }
 * }
 * ```
 */
// eslint-disable-next-line max-lines-per-function,@typescript-eslint/explicit-function-return-type,@typescript-eslint/explicit-module-boundary-types
export function mixInSubscriptionManager<B extends Constructor>(Base: B) {
  return class extends Base implements Unsubscribable {
    #subscriptions = new Subscription();

    // eslint-disable-next-line @typescript-eslint/max-params
    subscribeTo<T>(
      observable: Observable<T>,
      next?: (value: T) => void,
      error?: (error: any) => void,
      complete?: () => void,
    ): void {
      this.#subscriptions.add(
        observable.subscribe({
          next: next?.bind(this),
          error: error?.bind(this),
          complete: complete?.bind(this),
        }),
      );
    }

    manage(subscription: Subscription): void {
      this.#subscriptions.add(subscription);
    }

    unsubscribe(): void {
      this.#subscriptions.unsubscribe();
      this.#subscriptions = new Subscription();
    }
  };
}

/**
 * Tracks all subscriptions to easily unsubscribe from them all during cleanup. Also binds callbacks to `this` for convenient use as a superclass, e.g.:
 *
 * ```ts
 * class EventLogger extends SubscriptionManager {
 *   constructor(private prefix: string, event$: Observable<string>) {
 *     super();
 *
 *     // you can pass in an instance method here and it will be bound to `this`
 *     this.subscribeTo(event$, this.log);
 *   }
 *
 *   log(event: string) {
 *     // even though this is used as a callback, you can still use `this`
 *     console.log(this.prefix + event);
 *   }
 * }
 * ```
 */
export class SubscriptionManager extends mixInSubscriptionManager(Object) {}
