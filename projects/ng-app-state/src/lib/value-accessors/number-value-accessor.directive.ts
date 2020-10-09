import { Directive } from '@angular/core';
import { isNil } from 'micro-dash';
import { provideValueAccessor } from 'ng-core';
import { AbstractInputValueAccessorDirective } from './abstract-input-value-accessor.directive';

/** @hidden */
@Directive({
  selector: 'input[type=number][nasModel]',
  providers: [provideValueAccessor(NumberValueAccessorDirective)],
})
export class NumberValueAccessorDirective extends AbstractInputValueAccessorDirective {
  registerOnChange(fn: (value: number | null) => void): void {
    this.onChangeFn = (value: string) => {
      fn(value === '' ? null : parseFloat(value));
    };
  }

  writeValue(value: number): void {
    // The value needs to be normalized for IE9, otherwise it is set to 'null' when null
    this.element.value = isNil(value) ? '' : value.toString();
  }
}
