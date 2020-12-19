import { Deferred } from '@s-libs/js-core';
import { PromiseType } from 'utility-types';
import { AngularContext } from '../test-context';

export class TestCall<F extends jasmine.Func> {
  callInfo!: jasmine.CallInfo<F>;

  constructor(
    private deferred: Deferred<PromiseType<ReturnType<F>>>,
    private context?: AngularContext,
  ) {}

  flush(value: PromiseType<ReturnType<F>>): void {
    this.deferred.resolve(value);
    this.context?.tick();
  }

  error(reason: any): void {
    this.deferred.reject(reason);
    this.context?.tick();
  }
}
