import { Directive } from '@angular/core';
import { SelectControlValueAccessor } from '@angular/forms';
import { provideValueAccessor } from '@s-libs/ng-core';

/** @hidden */
@Directive({
  selector: 'select:not([multiple])[nasModel]',
  host: {
    '(change)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()',
  },
  providers: [
    provideValueAccessor(SelectValueAccessorDirective),
    {
      provide: SelectControlValueAccessor,
      useExisting: SelectValueAccessorDirective,
    },
  ],
  standalone: false,
})
export class SelectValueAccessorDirective extends SelectControlValueAccessor {}
