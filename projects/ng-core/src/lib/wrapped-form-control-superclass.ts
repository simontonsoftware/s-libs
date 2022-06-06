import { UntypedFormControl } from '@angular/forms';
import { WrappedControlSuperclass } from './wrapped-control-superclass';

/**
 * This is a convenience class to make it easier to extend {@linkcode WrappedControlSuperclass} when you specifically want a `FormControl` (as opposed to a `FormArray` or `FormGroup`).
 */
export abstract class WrappedFormControlSuperclass<
  OuterType,
  InnerType = OuterType,
> extends WrappedControlSuperclass<OuterType, InnerType> {
  control = new UntypedFormControl();
}
