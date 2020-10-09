import { Directive, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, SelectControlValueAccessor } from '@angular/forms';

/** @hidden */
@Directive({
  selector: 'select:not([multiple])[nasModel]',
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '(change)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectValueAccessorDirective),
      multi: true,
    },
    {
      provide: SelectControlValueAccessor,
      useExisting: forwardRef(() => SelectValueAccessorDirective),
    },
  ],
})
export class SelectValueAccessorDirective extends SelectControlValueAccessor {}
