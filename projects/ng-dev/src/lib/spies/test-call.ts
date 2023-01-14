import { Deferred } from '@s-libs/js-core';
import { PromiseType } from 'utility-types';
import { AngularContext } from '../angular-context';

/**
 * A mock method call that was made and is ready to be answered. This interface allows access to the underlying <code>jasmine.CallInfo</code>, and allows resolving or rejecting the asynchronous call's result.
 */
export class TestCall<F extends jasmine.Func> {
  /** The underlying jasmine call object */
  callInfo!: jasmine.CallInfo<F>;

  constructor(
    private deferred: Deferred<PromiseType<ReturnType<F>>>,
    private autoTick: boolean,
  ) {}

  /**
   * Resolve the call with the given value.
   */
  flush(value: PromiseType<ReturnType<F>>): void {
    this.deferred.resolve(value);
    this.maybeTick();
  }

  /**
   * Reject the call with the given reason.
   */
  error(reason: unknown): void {
    this.deferred.reject(reason);
    this.maybeTick();
  }

  private maybeTick(): void {
    if (this.autoTick) {
      AngularContext.getCurrent()?.tick();
    }
  }
}
