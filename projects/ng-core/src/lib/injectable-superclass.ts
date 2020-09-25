import { OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SubscriptionManager } from 's-rxjs-utils';

/**
 * Use as the superclass for anything managed by angular's dependency injection for care-free use of `subscribeTo()`. It simply calls `unsubscribe()` during `ngOnDestroy()`. If you override `ngOnDestroy()` in your subclass, be sure to invoke the super implementation.
 *
 * ```ts
 * @Injectable()
 * // or @Component() (also consider DirectiveSuperclass)
 * // or @Directive() (also consider DirectiveSuperclass)
 * // or @Pipe()
 * class MyThing extends InjectableSuperclass {
 *   constructor(somethingObservable: Observable) {
 *     super();
 *     this.subscribeTo(somethingObservable);
 *   }
 *
 *   ngOnDestroy() {
 *     // if you override ngOnDestroy, be sure to call this too
 *     super.ngOnDestroy();
 *   }
 * }
 * ```
 */
export abstract class InjectableSuperclass
  extends SubscriptionManager
  implements OnDestroy {
  /**
   * An observable that emits once when this object is destroyed, then completes.
   */
  destruction$: Observable<undefined>;

  private destructionSubject = new Subject<undefined>();

  constructor() {
    super();
    this.destruction$ = this.destructionSubject.asObservable();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    this.destructionSubject.next();
    this.destructionSubject.complete();
  }
}
