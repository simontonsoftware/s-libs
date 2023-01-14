import { Directive } from '@angular/core';
import { SelectControlValueAccessor } from '@angular/forms';
import { provideValueAccessor } from '@s-libs/ng-core';

/** @hidden */
@Directive({
  selector: 'select:not([multiple])[nasModel]',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
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
})
export class SelectValueAccessorDirective extends SelectControlValueAccessor {}
