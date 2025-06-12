import { Directive } from '@angular/core';
import { isNil } from '@s-libs/micro-dash';
import { provideValueAccessor } from '@s-libs/ng-core';
import { AbstractInputValueAccessorDirective } from './abstract-input-value-accessor.directive';

/** @hidden */
@Directive({
  selector: 'input[type=number][nasModel]',
  standalone: false,
  providers: [provideValueAccessor(NumberValueAccessorDirective)],
})
export class NumberValueAccessorDirective extends AbstractInputValueAccessorDirective {
  override registerOnChange(fn: (value: number | null) => void): void {
    this.onChangeFn = (value: string): void => {
      fn(value === '' ? null : parseFloat(value));
    };
  }

  override writeValue(value: number): void {
    // The value needs to be normalized for IE9, otherwise it is set to 'null' when null
    this.element.value = isNil(value) ? '' : value.toString();
  }
}
