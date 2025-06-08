import { Directive } from '@angular/core';
import { CheckboxControlValueAccessor } from '@angular/forms';
import { provideValueAccessor } from '@s-libs/ng-core';

/** @hidden */
@Directive({
  selector: 'input[type=checkbox][nasModel]',
  standalone: false,
  providers: [provideValueAccessor(CheckboxValueAccessorDirective)],
  host: {
    '(change)': 'onChange($any($event.target).checked)',
    '(blur)': 'onTouched()',
  },
})
export class CheckboxValueAccessorDirective extends CheckboxControlValueAccessor {}
