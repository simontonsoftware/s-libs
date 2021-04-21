import { Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { wrapMethod } from '@s-libs/js-core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormControlSuperclass } from './form-control-superclass';

/**
 * Extend this when creating a form control that simply wraps an existing form control, to reduce a lot of boilerplate. **Warning:** You _must_ include a constructor in your subclass.
 *
 * Example when you don't need to modify the wrapped control's value:
 * ```ts
 * @Component({
 *   template: `<input [formControl]="formControl">`,
 *   providers: [provideValueAccessor(StringComponent)],
 * })
 * class StringComponent extends WrappedFormControlSuperclass<string> {
 *   // This looks unnecessary, but is required for Angular to provide `Injector`
 *   constructor(injector: Injector) {
 *     super(injector);
 *   }
 * }
 * ```
 *
 * Example when you need to modify the wrapped control's value:
 * ```ts
 * @Component({
 *   template: `<input type="datetime-local" [formControl]="formControl">`,
 *   providers: [provideValueAccessor(DateComponent)],
 * })
 * class DateComponent extends WrappedFormControlSuperclass<Date, string> {
 *   // This looks unnecessary, but is required for Angular to provide `Injector`
 *   constructor(injector: Injector) {
 *     super(injector);
 *   }
 *
 *   protected innerToOuter(inner: string): Date {
 *     return new Date(inner + "Z");
 *   }
 *
 *   protected outerToInner(outer: Date): string {
 *     if (outer === null) {
 *       return ""; // happens during initialization
 *     }
 *     return outer.toISOString().substr(0, 16);
 *   }
 * }
 * ```
 */
export abstract class WrappedFormControlSuperclass<
  OuterType,
  InnerType = OuterType
> extends FormControlSuperclass<OuterType> {
  /** Bind this to your inner form control to make all the magic happen. */
  formControl = new FormControl();

  private incomingValues$ = new Subject<OuterType>();

  constructor(injector: Injector) {
    super(injector);
    this.subscribeTo(this.setUpOuterToInner$(this.incomingValues$), (inner) => {
      this.formControl.setValue(inner, { emitEvent: false });
    });
    this.subscribeTo(
      this.setUpInnerToOuter$(this.formControl.valueChanges),
      (outer) => {
        this.emitOutgoingValue(outer);
      },
    );
    wrapMethod(this.formControl, 'markAsTouched', {
      after: () => {
        this.onTouched();
      },
    });
  }

  /** Called as angular propagates values changes to this `ControlValueAccessor`. You normally do not need to use it. */
  handleIncomingValue(outer: OuterType): void {
    this.incomingValues$.next(outer);
  }

  /** Called as angular propagates disabled changes to this `ControlValueAccessor`. You normally do not need to use it. */
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.formControl.disable({ emitEvent: false });
    } else {
      this.formControl.enable({ emitEvent: false });
    }
    super.setDisabledState(this.isDisabled);
  }

  /**
   * Override this to modify a value coming from the outside to the format needed within this component.
   *
   * For more complex needs, see {@link #setUpOuterToInner$} instead.
   */
  protected outerToInner(outer: OuterType): InnerType {
    return (outer as unknown) as InnerType;
  }

  /**
   * Override this to for full control over the stream of values passed in to your subclass.
   *
   * In this example, incoming values are debounced before being passed through to the inner form control
   * ```ts
   * setUpOuterToInner$(outer$: Observable<OuterType>): Observable<InnerType> {
   *   return values$.pipe(
   *     debounce(300),
   *     map((outer) => doExpensiveTransformToInnerValue(outer)),
   *   );
   * }
   * ```
   *
   * For a simple transformation, see {@link #outerToInner} instead.
   */
  protected setUpOuterToInner$(
    outer$: Observable<OuterType>,
  ): Observable<InnerType> {
    return outer$.pipe(map((outer) => this.outerToInner(outer)));
  }

  /**
   * Override this to modify a value coming from within this component to the format expected on the outside.
   *
   * For more complex needs, see {@link #setUpInnerToOuter$} instead.
   */
  protected innerToOuter(inner: InnerType): OuterType {
    return (inner as unknown) as OuterType;
  }

  /**
   * Override this to for full control over the stream of values emitted from your subclass.
   *
   * In this example, illegal values are not emitted
   * ```ts
   * setUpInnerToOuter$(inner$: Observable<InnerType>): Observable<OuterType> {
   *   return values$.pipe(
   *     debounce(300),
   *     filter((inner) => isLegalValue(outer)),
   *   );
   * }
   * ```
   *
   * For a simple transformation, see {@link #innerToOuter} instead.
   */
  protected setUpInnerToOuter$(
    inner$: Observable<InnerType>,
  ): Observable<OuterType> {
    return inner$.pipe(map((inner) => this.innerToOuter(inner)));
  }
}
