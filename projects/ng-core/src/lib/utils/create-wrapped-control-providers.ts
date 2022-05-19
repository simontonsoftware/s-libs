import { Provider, Type } from '@angular/core';
import { provideValidators } from './provide-validators';
import { provideValueAccessor } from './provide-value-accessor';

/**
 * Use in the `providers` of a component that implements `ControlValueAccessor` & `Validator` to reduce some boilerplate.
 *
 * ```ts
 * @Component({ providers: createWrappedControlProviders(MyFormControl) }
 * class MyFormControl extends BaseFormControl {
 *   // ...
 * }
 * ```
 */
export function createWrappedControlProviders(type: Type<any>): Provider[] {
  return [provideValueAccessor(type), provideValidators(type)];
}
