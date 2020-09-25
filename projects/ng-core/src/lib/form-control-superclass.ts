import { Provider, Type } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'micro-dash';
import { DirectiveSuperclass } from './directive-superclass';

/**
 * Use in the `providers` of a component that implements `ControlValueAccessor` to reduce some boilerplate.
 *
 * ```ts
 * @Component({ providers: [provideValueAccessor(MyFormControl)] }
 * class MyFormControl extends BaseFormControl {
 *   // ...
 * }
 * ```
 */
export function provideValueAccessor(type: Type<any>): Provider {
  return {
    provide: NG_VALUE_ACCESSOR,
    useExisting: type,
    multi: true,
  };
}

/**
 * Extend this when creating a form control to reduce some boilerplate. **Warning:** You _must_ include a constructor in your subclass.
 *
 * This example allows 2-way binding to a number via `[(ngModel)]`, `[formControl]`, or any other technique that leverages the `ControlValueAccessor` interface.
 * ```ts
 * @Component({
 *   template: `
 *     <button (click)="increment()" [disabled]="isDisabled">{{ counter }}</button>
 *   `,
 *   providers: [provideValueAccessor(CounterComponent)],
 * })
 * class CounterComponent extends FormControlSuperclass<number> {
 *   counter = 0;
 *
 *   // This looks unnecessary, but is required for Angular to provide `Injector`
 *   constructor(injector: Injector) {
 *     super(injector);
 *   }
 *
 *   handleIncomingValue(value: number) {
 *     this.counter = value;
 *   }
 *
 *   increment() {
 *     this.emitOutgoingValue(++this.counter);
 *     this.onTouched();
 *   }
 * }
 * ```
 */
export abstract class FormControlSuperclass<T>
  extends DirectiveSuperclass
  implements ControlValueAccessor {
  /** Call this to emit a new value when it changes. */
  emitOutgoingValue: (value: T) => void = noop;

  /** Call this to "commit" a change, traditionally done e.g. on blur. */
  onTouched = noop;

  /** You can bind to this in your template as needed. */
  isDisabled = false;

  /** Implement this to handle a new value coming in from outside. */
  abstract handleIncomingValue(value: T): void;

  /** Called as angular propagates value changes to this `ControlValueAccessor`. You normally do not need to use it. */
  writeValue(value: T): void {
    this.handleIncomingValue(value);
    this.changeDetectorRef.markForCheck();
  }

  /** Called as angular sets up the binding to this `ControlValueAccessor`. You normally do not need to use it. */
  registerOnChange(fn: (value: T) => void): void {
    this.emitOutgoingValue = fn;
  }

  /** Called as angular sets up the binding to this `ControlValueAccessor`. You normally do not need to use it. */
  registerOnTouched(fn: VoidFunction): void {
    this.onTouched = fn;
  }

  /** Called as angular propagates disabled changes to this `ControlValueAccessor`. You normally do not need to use it. */
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.changeDetectorRef.markForCheck();
  }
}
