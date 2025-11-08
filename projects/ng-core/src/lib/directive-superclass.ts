import {
  ChangeDetectorRef,
  Directive,
  inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { isTruthy } from '@s-libs/js-core';
import { delayOnMicrotaskQueue } from '@s-libs/rxjs-core';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { InjectableSuperclass } from './injectable-superclass';

/* eslint-disable @typescript-eslint/no-deprecated -- this class itself is deprecated */

/**
 * @deprecated This class may be removed in a future version. Its purpose beyond {@link InjectableSuperclass} is now handled by Angular elegantly with signals. Consider migrating to signal inputs.
 *
 * Extend this when creating a directive (including a component, which is a kind of directive) to gain access to the helpers demonstrated below.
 *
 * ```ts
 * @Component({
 *   selector: "s-color-text",
 *   template: `
 *     <span [style.background]="color">{{ color }}</span>
 *   `,
 *   // note that `bindToInstance()` works even with OnPush change detection
 *   changeDetection: ChangeDetectionStrategy.OnPush,
 * })
 *  class ColorTextComponent extends DirectiveSuperclass {
 *   @Input() prefix?: string;
 *   @Input() prefix2?: string;
 *   color!: string;
 *
 *   constructor(@Inject("color$") color$: Observable<string>) {
 *     super();
 *
 *     // combine everything to calculate `color` and keep it up to date
 *     this.bindToInstance(
 *       "color",
 *       combineLatest(
 *         this.getInput$("prefix"),
 *         this.getInput$("prefix2"),
 *         color$,
 *       ).pipe(map((parts) => parts.filter((p) => p).join(""))),
 *     );
 *   }
 * }
 * ```
 */
// maybe this won't need the fake selector after https://github.com/angular/angular/issues/36427
// eslint-disable-next-line @angular-eslint/prefer-standalone
@Directive({ selector: '[slDirectiveSuperclass]', standalone: false })
export abstract class DirectiveSuperclass
  extends InjectableSuperclass
  implements OnChanges
{
  /**
   * @deprecated: This method may be removed in a future version. Its purpose is now handled by Angular elegantly with signals. Consider migrating to signal inputs.
   *
   * Emits the set of `@Input()` property names that change during each call to `ngOnChanges()`.
   */
  inputChanges$ = new Subject<Set<keyof this>>();

  #changeDetectorRef = inject(ChangeDetectorRef);
  #onChangesRan$ = new BehaviorSubject(false);

  ngOnChanges(changes: SimpleChanges): void {
    this.inputChanges$.next(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Angular's signature for `SimpleChanges` doesn't let us do any better
      new Set(Object.getOwnPropertyNames(changes) as Array<keyof this>),
    );
    this.#onChangesRan$.next(true);
  }

  /**
   * @deprecated: This method may be removed in a future version. Its purpose is now handled by Angular elegantly with signals. Consider migrating to signal inputs.
   *
   * @return an observable of the values for one of this directive's `@Input()` properties
   */
  getInput$<K extends keyof this>(key: K): Observable<this[K]> {
    // Should emit:
    //   - immediately if ngOnChanges was already called
    //   - on the first call to ngOnChanges
    //   - after a delay if ngOnChanges is never called (when nothing is bound to the directive)
    //   - when the value actually changes
    return merge(
      this.#onChangesRan$.pipe(filter(isTruthy), distinctUntilChanged()),
      this.inputChanges$,
      of(0).pipe(delayOnMicrotaskQueue()),
    ).pipe(
      map(() => this[key]),
      distinctUntilChanged(),
    );
  }

  /**
   * @deprecated: This method may be removed in a future version. Consider whether moving to signals will suit your needs.
   *
   * Binds an observable to one of this directive's instance variables. When the observable emits the instance variable will be updated, and change detection will be triggered to propagate any changes. Use this as an alternative to repeating `| async` multiple times in your template.
   */
  bindToInstance<K extends keyof this>(
    key: K,
    value$: Observable<this[K]>,
  ): void {
    this.subscribeTo(value$, (value) => {
      this[key] = value;
      this.#changeDetectorRef.markForCheck();
    });
  }
}
