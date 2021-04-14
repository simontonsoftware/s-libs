import { Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { wrapMethod } from '@s-libs/js-core';
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
 *   protected innerToOuter(value: string): Date {
 *     return new Date(value + "Z");
 *   }
 *
 *   protected outerToInner(value: Date): string {
 *     if (value === null) {
 *       return ""; // happens during initialization
 *     }
 *     return value.toISOString().substr(0, 16);
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

  constructor(injector: Injector) {
    super(injector);
    this.subscribeTo(this.formControl.valueChanges, (value) => {
      this.emitOutgoingValue(this.innerToOuter(value));
    });
    wrapMethod(this.formControl, 'markAsTouched', {
      after: () => {
        this.onTouched();
      },
    });
  }

  /** Called as angular propagates values changes to this `ControlValueAccessor`. You normally do not need to use it. */
  handleIncomingValue(value: OuterType): void {
    this.formControl.setValue(this.outerToInner(value), { emitEvent: false });
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

  /** Override this to modify a value coming from the outside to the format needed within this component. */
  protected outerToInner(value: OuterType): InnerType {
    return (value as any) as InnerType;
  }

  /** Override this to modify a value coming from within this component to the format expected on the outside. */
  protected innerToOuter(value: InnerType): OuterType {
    return (value as any) as OuterType;
  }
}
