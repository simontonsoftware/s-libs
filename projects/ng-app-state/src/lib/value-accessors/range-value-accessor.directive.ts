import { Directive } from '@angular/core';
import { provideValueAccessor } from '@s-libs/ng-core';
import { AbstractInputValueAccessorDirective } from './abstract-input-value-accessor.directive';

/** @hidden */
@Directive({
  selector: 'input[type=range][nasModel]',
  providers: [provideValueAccessor(RangeValueAccessorDirective)],
  standalone: false,
})
export class RangeValueAccessorDirective extends AbstractInputValueAccessorDirective {
  override registerOnChange(fn: (value: number) => void): void {
    this.onChangeFn = (value: string): void => {
      fn(parseFloat(value));
    };
  }
}
