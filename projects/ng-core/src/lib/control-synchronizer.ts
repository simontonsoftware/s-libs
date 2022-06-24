import { AbstractControl, ValidationErrors } from '@angular/forms';
import { wrapMethod } from '@s-libs/js-core';
import { isEqual, keys, omit, size } from '@s-libs/micro-dash';
import { SubscriptionManager } from '@s-libs/rxjs-core';
import { merge, MonoTypeOperatorFunction } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

type ErrorTransform = MonoTypeOperatorFunction<ValidationErrors>;

export class ControlSynchronizer {
  static synchronize(
    outer: AbstractControl,
    inner: AbstractControl,
    outerToInnerTransform: ErrorTransform,
    innerToOuterTransform: ErrorTransform,
    subscriptionManager: SubscriptionManager,
  ): void {
    const outerSync = new ControlSynchronizer(outer);
    const innerSync = new ControlSynchronizer(inner);
    outerSync.#acceptErrorsFrom(
      innerSync,
      innerToOuterTransform,
      subscriptionManager,
    );
    innerSync.#acceptErrorsFrom(
      outerSync,
      outerToInnerTransform,
      subscriptionManager,
    );
  }

  #errorsFromPartner: ValidationErrors = {};
  #originalSetErrors = this.control.setErrors.bind(this.control);
  #finishingAsync = false;

  private constructor(private control: AbstractControl) {
    wrapMethod(control, 'updateValueAndValidity', {
      around: (original, ...args) => {
        // when finishing async validators we instructed our partner to re-run its own validators. That could in turn try to re-trigger ours, dropping the errors we just set, putting us into a pending state, and re-triggering our own async validators that just completed.
        if (!this.#finishingAsync) {
          original.apply(control, args);
        }
      },
    });
    wrapMethod(control, 'setErrors', {
      // ignore the second "opts" parameter that could set `emitEvent: false`. When async validation completes, we need to ensure a `statusChange` fires so we synchronize with `#partner`
      around: (_, newNativeErrors) => {
        this.#finishingAsync = true;
        this.#updateCombinedErrors(newNativeErrors);
        this.#finishingAsync = false;
      },
    });
    control.addValidators(() => this.#errorsFromPartner);
  }

  #acceptErrorsFrom(
    partner: ControlSynchronizer,
    transform: ErrorTransform,
    subscriptionManager: SubscriptionManager,
  ): void {
    subscriptionManager.subscribeTo(
      merge(partner.control.statusChanges, Promise.resolve()).pipe(
        map(() => partner.#getNativeErrors()),
        distinctUntilChanged(isEqual),
        transform,
      ),
      (transformedErrors) => {
        this.#setAddedErrors(transformedErrors);
      },
    );
  }

  #setAddedErrors(errorsToAdd: ValidationErrors): void {
    this.#errorsFromPartner = errorsToAdd;
    this.control.updateValueAndValidity({ emitEvent: false });
  }

  #getNativeErrors(): ValidationErrors {
    // TODO: remove the `!` after https://github.com/simontonsoftware/s-libs/issues/78
    return omit(this.control.errors!, ...keys(this.#errorsFromPartner));
  }

  #updateCombinedErrors(nativeErrors: ValidationErrors | null): void {
    const combinedErrors = { ...nativeErrors, ...this.#errorsFromPartner };
    this.#originalSetErrors(size(combinedErrors) ? combinedErrors : null);
  }
}