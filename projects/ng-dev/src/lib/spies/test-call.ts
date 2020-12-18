import { Deferred } from '@s-libs/js-core';
import { AngularContext } from '../test-context';

export class TestCall {
  // TODO: make this typing better (instead of using any)
  callInfo!: jasmine.CallInfo<any>;

  // TODO: make this typing better (instead of using any)
  constructor(
    private deferred: Deferred<any>,
    private context?: AngularContext,
  ) {}

  // TODO: make this typing better (instead of using any)
  flush(value: any): void {
    this.deferred.resolve(value);
    this.context?.tick();
  }

  // TODO: make this typing better (instead of using any)
  error(reason: any): void {
    this.deferred.reject(reason);
    this.context?.tick();
  }
}
