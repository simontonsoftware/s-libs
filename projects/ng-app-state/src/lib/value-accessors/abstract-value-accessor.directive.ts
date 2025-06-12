import { Directive, ElementRef, inject } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { noop } from '@s-libs/micro-dash';

@Directive()
export abstract class AbstractValueAccessorDirective<T extends HTMLElement>
  implements ControlValueAccessor
{
  onChangeFn!: (value: any) => void;
  onTouchedFn = noop;

  #elementRef = inject<ElementRef<T>>(ElementRef);

  protected get element(): T {
    return this.#elementRef.nativeElement;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  abstract writeValue(value: unknown): void;
}
