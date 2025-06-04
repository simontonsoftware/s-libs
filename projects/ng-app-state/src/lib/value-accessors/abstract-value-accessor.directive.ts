import { Directive, ElementRef, Injector } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { noop } from '@s-libs/micro-dash';

@Directive()
export abstract class AbstractValueAccessorDirective<T extends HTMLElement>
  implements ControlValueAccessor
{
  onChangeFn!: (value: any) => void;
  onTouchedFn = noop;

  private elementRef: ElementRef<T>;

  constructor(injector: Injector) {
    this.elementRef = injector.get(ElementRef);
  }

  protected get element(): T {
    return this.elementRef.nativeElement;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  abstract writeValue(value: unknown): void;
}
