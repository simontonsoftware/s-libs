import { Directive, HostListener } from '@angular/core';
import { AbstractValueAccessorDirective } from './abstract-value-accessor.directive';

/** @hidden */
@Directive()
export abstract class AbstractInputValueAccessorDirective extends AbstractValueAccessorDirective<
  HTMLInputElement
> {
  @HostListener('change')
  @HostListener('input')
  onChange(): void {
    this.onChangeFn(this.element.value);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouchedFn();
  }

  writeValue(value: any): void {
    this.element.value = value;
  }

  setDisabledState(isDisabled: boolean): void {
    this.element.disabled = isDisabled;
  }
}
