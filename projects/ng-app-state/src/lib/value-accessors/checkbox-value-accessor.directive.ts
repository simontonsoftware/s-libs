import { Directive, forwardRef } from '@angular/core';
import {
  CheckboxControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

/** @hidden */
@Directive({
  selector: 'input[type=checkbox][nasModel]',
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '(change)': 'onChange($event.target.checked)',
    '(blur)': 'onTouched()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxValueAccessorDirective),
      multi: true,
    },
  ],
})
export class CheckboxValueAccessorDirective extends CheckboxControlValueAccessor {}
