import { Deferred } from '@s-libs/js-core';
import { Mock } from '@vitest/spy';
import { AngularContext } from '../angular-context';
import { Func, ResolveType } from '../interfaces';
import { TestCall } from './test-call';

/**
 * A mock method call that was made and is ready to be answered. This interface allows resolving or rejecting the asynchronous call's result.
 */
export class AsyncTestCall<F extends Func> extends TestCall<F> {
  constructor(
    mock: Mock<F>,
    index: number,
    private deferred: Deferred<ResolveType<F>>,
  ) {
    super(mock, index);
  }

  /**
   * Resolve the call with the given value.
   */
  async flush(value: ResolveType<F>): Promise<void> {
    this.deferred.resolve(value);
    await AngularContext.getCurrent()?.tick();
  }

  /**
   * Reject the call with the given reason.
   */
  async error(reason: unknown): Promise<void> {
    this.deferred.reject(reason);
    await AngularContext.getCurrent()?.tick();
  }
}
