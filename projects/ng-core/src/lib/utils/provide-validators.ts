import { Provider, Type } from '@angular/core';
import { NG_VALIDATORS } from '@angular/forms';

/**
 * Use in the `providers` of a component that implements `Validator` to reduce some boilerplate.
 *
 * ```ts
 * @Component({ providers: [provideValidators(MyFormControl)] }
 * class MyFormControl extends BaseFormControl {
 *   // ...
 * }
 * ```
 */
export function provideValidators(type: Type<any>): Provider {
  return {
    provide: NG_VALIDATORS,
    useExisting: type,
    multi: true,
  };
}
