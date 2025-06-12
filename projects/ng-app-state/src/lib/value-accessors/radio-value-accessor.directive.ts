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
  // eslint-disable-next-line @typescript-eslint/no-misused-promises -- adding during upgrade to 19. Unsure of alternative.
  override async writeValue(obj: unknown): Promise<void> {
    // delay because `button.value` may not be set yet as the component is being initialized
    await Promise.resolve();
    this.element.checked = this.element.value === obj;
  }
}
