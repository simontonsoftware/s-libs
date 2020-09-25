import { Observable, Subscription, Unsubscribable } from 'rxjs';

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
export class SubscriptionManager implements Unsubscribable {
  private subscriptions = new Subscription();

  subscribeTo<T>(
    observable: Observable<T>,
    next?: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void,
  ): void {
    this.subscriptions.add(
      observable.subscribe(
        this.bind(next),
        this.bind(error),
        this.bind(complete),
      ),
    );
  }

  unsubscribe(): void {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
  }

  private bind<T extends (val?: any) => void>(fn?: T): T | undefined {
    return fn?.bind(this);
  }
}
