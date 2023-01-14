import { Directive } from '@angular/core';
import { CheckboxControlValueAccessor } from '@angular/forms';
import { provideValueAccessor } from '@s-libs/ng-core';

/** @hidden */
@Directive({
  selector: 'input[type=checkbox][nasModel]',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '(change)': 'onChange($event.target.checked)',
    '(blur)': 'onTouched()',
  },
  providers: [provideValueAccessor(CheckboxValueAccessorDirective)],
})
export class CheckboxValueAccessorDirective extends CheckboxControlValueAccessor {}
