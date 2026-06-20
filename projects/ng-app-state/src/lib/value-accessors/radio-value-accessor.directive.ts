import { Directive } from '@angular/core';
import { provideValueAccessor } from '@s-libs/ng-core';
import { AbstractInputValueAccessorDirective } from './abstract-input-value-accessor.directive';

/** @hidden */
@Directive({
  selector: 'input[type=radio][nasModel]',
  standalone: false,
  providers: [provideValueAccessor(RadioValueAccessorDirective)],
})
export class RadioValueAccessorDirective extends AbstractInputValueAccessorDirective {
  override writeValue(obj: unknown): void {
    // delay because `button.value` may not be set yet as the component is being initialized
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.resolve().then(() => {
      this.element.checked = this.element.value === obj;
    });
  }
}
