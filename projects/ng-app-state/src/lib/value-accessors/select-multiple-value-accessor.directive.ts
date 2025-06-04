import { Directive } from '@angular/core';
import { SelectMultipleControlValueAccessor } from '@angular/forms';
import { provideValueAccessor } from '@s-libs/ng-core';

/** @hidden */
@Directive({
  selector: 'select[multiple][nasModel]',
  host: { '(change)': 'onChange($event.target)', '(blur)': 'onTouched()' },
  providers: [
    provideValueAccessor(SelectMultipleValueAccessorDirective),
    {
      provide: SelectMultipleControlValueAccessor,
      useExisting: SelectMultipleValueAccessorDirective,
    },
  ],
  standalone: false,
})
export class SelectMultipleValueAccessorDirective extends SelectMultipleControlValueAccessor {}
