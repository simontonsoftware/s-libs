import { Directive } from '@angular/core';
import { SelectControlValueAccessor } from '@angular/forms';
import { provideValueAccessor } from '@s-libs/ng-core';

/** @hidden */
@Directive({
  selector: 'select:not([multiple])[nasModel]',
  standalone: false,
  providers: [
    provideValueAccessor(SelectValueAccessorDirective),
    {
      provide: SelectControlValueAccessor,
      useExisting: SelectValueAccessorDirective,
    },
  ],
  host: {
    '(change)': 'onChange($any($event.target).value)',
    '(blur)': 'onTouched()',
  },
})
export class SelectValueAccessorDirective extends SelectControlValueAccessor {}
