import { ChangeDetectorRef, inject } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { noop } from '@s-libs/micro-dash';
import { DirectiveSuperclass } from '../directive-superclass';

/**
 * Extend this when creating a form control to reduce some boilerplate.
 *
 * This example allows 2-way binding to a number via `[(ngModel)]`, `[formControl]`, or any other technique that leverages the `ControlValueAccessor` interface.
 * ```ts
 * @Component({
 *   template: `
 *     <button (click)="increment()" [disabled]="isDisabled">{{ counter }}</button>
 *   `,
 *   providers: [provideValueAccessor(CounterComponent)],
 * })
 * class CounterComponent extends FormComponentSuperclass<number> {
 *   counter = 0;
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
export abstract class FormComponentSuperclass<T>
  extends DirectiveSuperclass
  implements ControlValueAccessor
{
  /** Call this to emit a new value when it changes. */
  emitOutgoingValue: (value: T) => void = noop;

  /** Call this to "commit" a change, traditionally done e.g. on blur. */
  onTouched = noop;

  /** You can bind to this in your template as needed. */
  isDisabled = false;

  #changeDetectorRef = inject(ChangeDetectorRef);

  /** Called as angular propagates value changes to this `ControlValueAccessor`. You normally do not need to use it. */
  writeValue(value: T): void {
    this.handleIncomingValue(value);
    this.#changeDetectorRef.markForCheck();
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
    this.#changeDetectorRef.markForCheck();
  }

  /** Implement this to handle a new value coming in from outside. */
  abstract handleIncomingValue(value: T): void;
}
