import { Directive, ElementRef, inject, Renderer2 } from '@angular/core';
import { COMPOSITION_BUFFER_MODE, DefaultValueAccessor } from '@angular/forms';
import { provideValueAccessor } from '@s-libs/ng-core';

/** @hidden */
@Directive({
  selector:
    'input:not([type=checkbox]):not([type=number]):not([type=radio]):not([type=range])[nasModel],textarea[nasModel]',
  standalone: false,
  providers: [provideValueAccessor(InputValueAccessorDirective)],
  host: {
    '(input)': '$any(this)._handleInput($any($event.target).value)',
    '(blur)': 'onTouched()',
    '(compositionstart)': '$any(this)._compositionStart()',
    '(compositionend)': '$any(this)._compositionEnd($any($event.target).value)',
  },
})
export class InputValueAccessorDirective extends DefaultValueAccessor {
  constructor() {
    super(
      inject(Renderer2),
      inject(ElementRef),
      inject(COMPOSITION_BUFFER_MODE, { optional: true }) ?? false,
    );
  }
}
