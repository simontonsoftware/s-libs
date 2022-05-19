import { Directive, ErrorHandler, Injector, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors, Validator } from '@angular/forms';
import { wrapMethod } from '@s-libs/js-core';
import { bindKey, flow } from '@s-libs/micro-dash';
import {
  MonoTypeOperatorFunction,
  Observable,
  retry,
  Subject,
  tap,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { FormComponentSuperclass } from './form-component-superclass';

/**
 * Extend this when creating a form component that simply wraps existing ones, to reduce a lot of boilerplate. **Warning:** You _must_ include a constructor in your subclass.
 *
 * To wrap a single form control use the subclass {@linkcode WrappedFormControlSuperclass}:
 * ```ts
 * @Component({
 *   template: `<input [formControl]="control">`,
 *   providers: [provideValueAccessor(StringComponent)],
 * })
 * class StringComponent extends WrappedFormControlSuperclass<string> {}
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
 * class DateComponent extends WrappedFormControlSuperclass<Date, string> {
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
  implements OnInit, Validator
{
  /** Bind this to your inner form control to make all the magic happen. */
  abstract control: AbstractControl;

  #incomingValues$ = new Subject<OuterType>();
  #errorHandler: ErrorHandler;

  constructor(injector: Injector) {
    super(injector);
    this.#errorHandler = injector.get(ErrorHandler);
    this.subscribeTo(
      this.setUpOuterToInner$(this.#incomingValues$),
      (inner) => {
        this.control.setValue(inner, { emitEvent: false });
      },
    );
  }

  ngOnInit(): void {
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
    this.#incomingValues$.next(outer);
  }

  /** Called as angular propagates disabled changes to this `ControlValueAccessor`. You normally do not need to use it. */
  override setDisabledState(isDisabled: boolean): void {
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
   * For more complex needs, see {@linkcode #setUpOuterToInner$} instead.
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
   *   return outer$.pipe(
   *     debounce(300),
   *     map((outer) => doExpensiveTransformToInnerValue(outer)),
   *   );
   * }
   * ```
   *
   * For a simple transformation, see {@linkcode #outerToInner} instead.
   */
  protected setUpOuterToInner$(
    outer$: Observable<OuterType>,
  ): Observable<InnerType> {
    return outer$.pipe(
      map((outer) => this.outerToInner(outer)),
      this.#handleError(),
    );
  }

  /**
   * Override this to modify a value coming from within this component to the format expected on the outside.
   *
   * For more complex needs, see {@linkcode #setUpInnerToOuter$} instead.
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
   *   return inner$.pipe(
   *     debounce(300),
   *     filter((inner) => isLegalValue(outer)),
   *   );
   * }
   * ```
   *
   * For a simple transformation, see {@linkcode #innerToOuter} instead.
   */
  protected setUpInnerToOuter$(
    inner$: Observable<InnerType>,
  ): Observable<OuterType> {
    return inner$.pipe(
      map((inner) => this.innerToOuter(inner)),
      this.#handleError(),
    );
  }

  protected validate(): ValidationErrors | null {
    /**
     * Control errors in the FormGroup (FormArray) are not returned with the `errors` property,
     * so they need to be obtained from them or return a general error
     */
    return this.control.invalid
      ? this.control.errors ?? { wrappedControlInvalid: true }
      : null;
  }

  #handleError<T>(): MonoTypeOperatorFunction<T> {
    return flow(
      tap<T>({ error: bindKey(this.#errorHandler, 'handleError') }),
      retry(),
    );
  }
}
