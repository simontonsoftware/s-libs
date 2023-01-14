import {
  Directive,
  ElementRef,
  Inject,
  Optional,
  Renderer2,
} from '@angular/core';
import { COMPOSITION_BUFFER_MODE, DefaultValueAccessor } from '@angular/forms';
import { provideValueAccessor } from '@s-libs/ng-core';

/** @hidden */
@Directive({
  selector:
    'input:not([type=checkbox]):not([type=number]):not([type=radio]):not([type=range])[nasModel],textarea[nasModel]',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '(input)': '$any(this)._handleInput($event.target.value)',
    '(blur)': 'onTouched()',
    '(compositionstart)': '$any(this)._compositionStart()',
    '(compositionend)': '$any(this)._compositionEnd($event.target.value)',
  },
  providers: [provideValueAccessor(InputValueAccessorDirective)],
})
export class InputValueAccessorDirective extends DefaultValueAccessor {
  constructor(
    renderer: Renderer2,
    elementRef: ElementRef,
    @Optional()
    @Inject(COMPOSITION_BUFFER_MODE)
    _compositionMode: boolean,
  ) {
    super(renderer, elementRef, _compositionMode);
  }
}
