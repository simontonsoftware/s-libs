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
  // In TypeScript 6, it became illegal to have a private field inside an exported anonymous class.
  const privateFieldWorkaround = new WeakMap<any, Subject<void>>();
  function getDestructionSubject(key: any): Subject<void> {
    if (!privateFieldWorkaround.has(key)) {
      privateFieldWorkaround.set(key, new Subject());
    }
    return privateFieldWorkaround.get(key)!;
  }

  return class extends mixInSubscriptionManager(Base) {
    /**
     * An observable that emits once when this object is destroyed, then completes.
     */
    destruction$ = getDestructionSubject(this).asObservable();

    constructor(...args: any[]) {
      super(...args);
      inject(DestroyRef).onDestroy(() => {
        this.unsubscribe();
        getDestructionSubject(this).next();
        getDestructionSubject(this).complete();
      });
    }
  };
}

/**
 * Use as the superclass for anything managed by Angular's dependency injection for care-free use of `subscribeTo()`. It simply calls `unsubscribe()` when the object is destroyed. Note that the object must be created in an {@link https://angular.dev/guide/di/dependency-injection-context | injection context}.
 *
 * ```ts
 * @Injectable() // or @Component(), @Directive() or @Pipe()
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
