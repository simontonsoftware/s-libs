import { FormControl } from '@angular/forms';
import { WrappedAbstractControlSuperclass } from './wrapped-abstract-control-superclass';

/**
 * Extend this when creating a form control that simply wraps an existing form control, to reduce a lot of boilerplate. **Warning:** You _must_ include a constructor in your subclass.
 *
 * Example when you don't need to modify the wrapped control's value:
 * ```ts
 * @Component({
 *   template: `<input [formControl]="formControl">`,
 *   providers: [provideValueAccessor(StringComponent)],
 * })
 * class StringComponent extends WrappedFormControlSuperclass<string> {
 *   // This looks unnecessary, but is required for Angular to provide `Injector`
 *   constructor(injector: Injector) {
 *     super(injector);
 *   }
 * }
 * ```
 *
 * Example when you need to modify the wrapped control's value:
 * ```ts
 * @Component({
 *   template: `<input type="datetime-local" [formControl]="formControl">`,
 *   providers: [provideValueAccessor(DateComponent)],
 * })
 * class DateComponent extends WrappedFormControlSuperclass<Date, string> {
 *   // This looks unnecessary, but is required for Angular to provide `Injector`
 *   constructor(injector: Injector) {
 *     super(injector);
 *   }
 *
 *   protected innerToOuter(inner: string): Date {
 *     return new Date(inner + "Z");
 *   }
 *
 *   protected outerToInner(outer: Date): string {
 *     if (outer === null) {
 *       return ""; // happens during initialization
 *     }
 *     return outer.toISOString().substr(0, 16);
 *   }
 * }
 * ```
 */
export abstract class WrappedFormControlSuperclass<
  OuterType,
  InnerType = OuterType,
> extends WrappedAbstractControlSuperclass<OuterType, InnerType> {
  /** Bind this to your inner form control to make all the magic happen. */
  formControl: FormControl = new FormControl();
}
