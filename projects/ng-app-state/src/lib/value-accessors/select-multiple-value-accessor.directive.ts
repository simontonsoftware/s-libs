import { Directive } from '@angular/core';
import { SelectMultipleControlValueAccessor } from '@angular/forms';
import { provideValueAccessor } from '@s-libs/ng-core';

/** @hidden */
@Directive({
  selector: 'select[multiple][nasModel]',
  standalone: false,
  providers: [
    provideValueAccessor(SelectMultipleValueAccessorDirective),
    {
      provide: SelectMultipleControlValueAccessor,
      useExisting: SelectMultipleValueAccessorDirective,
    },
  ],
  host: { '(change)': 'onChange($event.target)', '(blur)': 'onTouched()' },
})
export class SelectMultipleValueAccessorDirective extends SelectMultipleControlValueAccessor {}
