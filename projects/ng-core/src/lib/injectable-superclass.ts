import { DestroyRef, inject } from '@angular/core';
import { Constructor } from '@s-libs/js-core';
import { mixInSubscriptionManager } from '@s-libs/rxjs-core';
import { Subject } from 'rxjs';

/**
 * Mixes in {@link InjectableSuperclass} as an additional superclass.
 *
 * ```ts
 * class MySubclass extends mixInInjectableSuperclass(MyOtherSuperclass) {
 *   subscribeWithAutoUnsubscribe(observable: Observable<any>) {
 *     this.subscribeTo(observable);
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/explicit-module-boundary-types -- I'm not sure how to describe the return type
export function mixInInjectableSuperclass<B extends Constructor>(Base: B) {
  return class extends mixInSubscriptionManager(Base) {
    #destructionSubject = new Subject<void>();

    /**
     * An observable that emits once when this object is destroyed, then completes.
     */
    // eslint-disable-next-line @typescript-eslint/member-ordering -- ordered like this to avoid writing a constructor, which causes a different error
    destruction$ = this.#destructionSubject.asObservable();

    constructor(...args: any[]) {
      super(...args);
      inject(DestroyRef).onDestroy(() => {
        this.unsubscribe();
        this.#destructionSubject.next();
        this.#destructionSubject.complete();
      });
    }
  };
}

/**
 * Use as the superclass for anything managed by Angular's dependency injection for care-free use of `subscribeTo()`. It simply calls `unsubscribe()` when the object is destroyed. Note that the object must be created in an [injection context]{@link https://angular.io/guide/dependency-injection-context}.
 *
 * ```ts
 * @Injectable() // or @Component(), @Directive() or @Pipe(), but consider DirectiveSuperclass
 * class MyThing extends InjectableSuperclass {
 *   constructor(somethingObservable: Observable) {
 *     super();
 *     this.subscribeTo(somethingObservable);
 *   }
 * }
 * ```
 */
export abstract class InjectableSuperclass extends mixInInjectableSuperclass(
  Object,
) {}
