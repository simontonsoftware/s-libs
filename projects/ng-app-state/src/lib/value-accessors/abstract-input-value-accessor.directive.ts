import { Directive, HostListener } from '@angular/core';
import { AbstractValueAccessorDirective } from './abstract-value-accessor.directive';

@Directive()
export abstract class AbstractInputValueAccessorDirective extends AbstractValueAccessorDirective<HTMLInputElement> {
  @HostListener('change')
  @HostListener('input')
  onChange(): void {
    this.onChangeFn(this.element.value);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouchedFn();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types -- required so subclass can make it `number`
  writeValue(value: any): void {
    this.element.value = value;
  }

  setDisabledState(isDisabled: boolean): void {
    this.element.disabled = isDisabled;
  }
}
