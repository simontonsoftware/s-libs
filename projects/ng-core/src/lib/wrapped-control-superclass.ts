import { Directive, OnInit } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { wrapMethod } from '@s-libs/js-core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormComponentSuperclass } from './form-component-superclass';

/**
 * Extend this when creating a form component that simply wraps existing ones, to reduce a lot of boilerplate. **Warning:** You _must_ include a constructor in your subclass.
 *
 * A simple example:
 * ```ts
 * @Component({
 *   template: `<input [formControl]="control">`,
 *   providers: [provideValueAccessor(StringComponent)],
 * })
 * class StringComponent extends WrappedControlSuperclass<string> {
 *   // This looks unnecessary, but is required for Angular to provide `Injector`
 *   constructor(injector: Injector) {
 *     super(injector);
 *   }
 * }
 * ```
 *
 * Example of wrapping multiple inner components:
 * ```ts
 * class FullName {
 *   firstName = '';
 *   lastName = '';
 * }
 *
 * @Component({
 *   selector: 'app-full-name',
 *   template: `
 *     <div [formGroup]="control">
 *       <input id="first" formControlName="firstName" />
 *       <input id="last" formControlName="lastName" />
 *     </div>
 *   `,
 *   providers: [provideValueAccessor(FullNameComponent)],
 * })
 * class FullNameComponent extends WrappedControlSuperclass<FullName> {
 *   control = new FormGroup({
 *     firstName: new FormControl(),
 *     lastName: new FormControl(),
 *   });
 *
 *   // This looks unnecessary, but is required for Angular to provide `Injector`
 *   constructor(injector: Injector) {
 *     super(injector);
 *   }
 *
 *   protected outerToInner(outer: FullName | null): FullName {
 *     // `outer` can come in as `null` during initialization when the user binds with `ngModel`
 *     return outer || new FullName();
 *   }
 * }
 * ```
 *
 * Example when you need to modify the wrapped control's value:
 * ```ts
 * @Component({
 *   template: `<input type="datetime-local" [control]="formControl">`,
 *   providers: [provideValueAccessor(DateComponent)],
 * })
 * class DateComponent extends WrappedControlSuperclass<Date, string> {
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
@Directive()
export abstract class WrappedControlSuperclass<OuterType, InnerType = OuterType>
  extends FormComponentSuperclass<OuterType>
  implements OnInit
{
  /** Bind this to your inner form control to make all the magic happen. By default this is a `FormControl`, but for a complex component you can override it to be a `FormGroup` or `FormArray`. */
  control: AbstractControl = new FormControl();

  private incomingValues$ = new Subject<OuterType>();

  ngOnInit(): void {
    this.subscribeTo(this.setUpOuterToInner$(this.incomingValues$), (inner) => {
      this.control.setValue(inner, { emitEvent: false });
    });
    this.subscribeTo(
      this.setUpInnerToOuter$(this.control.valueChanges),
      (outer) => {
        this.emitOutgoingValue(outer);
      },
    );
    wrapMethod(this.control, 'markAsTouched', {
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
      this.control.disable({ emitEvent: false });
    } else {
      this.control.enable({ emitEvent: false });
    }
    super.setDisabledState(this.isDisabled);
  }

  /**
   * Override this to modify a value coming from the outside to the format needed within this component.
   *
   * For more complex needs, see {@link #setUpOuterToInner$} instead.
   */
  protected outerToInner(outer: OuterType): InnerType {
    return outer as unknown as InnerType;
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
    return inner as unknown as OuterType;
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
