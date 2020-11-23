import {
  ChangeDetectorRef,
  Directive,
  Injector,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { InjectableSuperclass } from './injectable-superclass';

/**
 * Extend this when creating a directive (including a component, which is a kind of directive) to gain access to the helpers demonstrated below. **Warning:** You _must_ include a constructor in your subclass.
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
 *   // Even if you don't need extra arguments injector, you must still include a constructor. It is required for angular to provide `Injector`.
 *   constructor(
 *     @Inject("color$") color$: Observable<string>,
 *     injector: Injector,
 *   ) {
 *     super(injector);
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
@Directive({ selector: '[sDirectiveSuperclass]' })
// tslint:disable-next-line:directive-class-suffix
export abstract class DirectiveSuperclass
  extends InjectableSuperclass
  implements OnChanges {
  /**
   *  Emits the set of `@Input()` property names that change during each call to `ngOnChanges()`.
   */
  inputChanges$ = new Subject<Set<keyof this>>();

  protected changeDetectorRef: ChangeDetectorRef;

  constructor(injector: Injector) {
    super();
    this.changeDetectorRef = injector.get(ChangeDetectorRef);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.inputChanges$.next(
      new Set(Object.getOwnPropertyNames(changes) as Array<keyof this>),
    );
  }

  /**
   * @return an observable of the values for one of this directive's `@Input()` properties
   */
  getInput$<K extends keyof this>(key: K): Observable<this[K]> {
    return this.inputChanges$.pipe(
      filter((keys) => keys.has(key)),
      startWith(undefined),
      map(() => this[key]),
    );
  }

  /**
   * Binds an observable to one of this directive's instance variables. When the observable emits the instance variable will be updated, and change detection will be triggered to propagate any changes. Use this an an alternative to repeating `| async` multiple times in your template.
   */
  bindToInstance<K extends keyof this>(
    key: K,
    value$: Observable<this[K]>,
  ): void {
    this.subscribeTo(value$, (value) => {
      this[key] = value;
      this.changeDetectorRef.markForCheck();
    });
  }
}
