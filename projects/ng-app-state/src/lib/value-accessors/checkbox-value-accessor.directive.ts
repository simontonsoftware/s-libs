import { Directive } from '@angular/core';
import { CheckboxControlValueAccessor } from '@angular/forms';
import { provideValueAccessor } from '@s-libs/ng-core';

/** @hidden */
@Directive({
  selector: 'input[type=checkbox][nasModel]',
  host: {
    '(change)': 'onChange($event.target.checked)',
    '(blur)': 'onTouched()',
  },
  providers: [provideValueAccessor(CheckboxValueAccessorDirective)],
  standalone: false,
})
export class CheckboxValueAccessorDirective extends CheckboxControlValueAccessor {}
