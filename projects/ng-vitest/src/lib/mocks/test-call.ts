import { Deferred } from '@s-libs/js-core';
import { MockParameters } from '@vitest/spy';
import { AngularContext } from '../angular-context';
import { Func, ResolveType } from '../interfaces';

/**
 * A mock method call that was made and is ready to be answered. This interface allows access to the underlying <code>jasmine.CallInfo</code>, and allows resolving or rejecting the asynchronous call's result.
 */
export class TestCall<F extends Func> {
  args!: MockParameters<F>;

  constructor(
    private deferred: Deferred<ResolveType<F>>,
    private autoTick: boolean,
  ) {}

  /**
   * Resolve the call with the given value.
   */
  async flush(value: ResolveType<F>): Promise<void> {
    this.deferred.resolve(value);
    await this.#maybeTick();
  }

  /**
   * Reject the call with the given reason.
   */
  async error(reason: unknown): Promise<void> {
    this.deferred.reject(reason);
    await this.#maybeTick();
  }

  async #maybeTick(): Promise<void> {
    if (this.autoTick) {
      await AngularContext.getCurrent()?.tick();
    }
  }
}
