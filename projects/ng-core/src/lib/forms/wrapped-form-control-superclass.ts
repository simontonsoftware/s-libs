import { FormControl } from '@angular/forms';
import { WrappedControlSuperclass } from './wrapped-control-superclass';

/**
 * This class is deprecated because its `control` implementation is not type safe. Transition to a type safe alternative by directly inheriting from {@linkcode WrappedControlSuperclass} and setting up your control with the typing and initial value you need. See the documentation on that class for an example.
 *
 * @deprecated
 */
export abstract class WrappedFormControlSuperclass<
  OuterType,
  InnerType = OuterType,
> extends WrappedControlSuperclass<OuterType, InnerType> {
  control = new FormControl();
}
