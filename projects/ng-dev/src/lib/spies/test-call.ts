import { Deferred } from '@s-libs/js-core';

export class TestCall {
  // TODO: make this typing better (instead of using any)
  callInfo!: jasmine.CallInfo<any>;

  // TODO: make this typing better (instead of using any)
  constructor(private deferred: Deferred<any>) {}

  // TODO: make this typing better (instead of using any)
  flush(value: any): void {
    this.deferred.resolve(value);
  }

  error(reason: any): void {
    this.deferred.reject(reason);
  }
}
