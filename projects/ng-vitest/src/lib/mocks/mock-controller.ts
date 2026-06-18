import { Mock } from '@vitest/spy';
import { Func } from '../interfaces';
import { CallTracker } from './call-tracker';
import { TestCall } from './test-call';

/**
 * Provides expectations and matching around a vitest mock that will be familiar to users of Angular's {@linkcode https://angular.dev/api/common/http/testing/HttpTestingController | HttpTestingController}.
 */
export class MockController<F extends Func> extends CallTracker<TestCall<F>> {
  /**
   * **Warning:** Do not clear the history of the passed-in mock. If you do, this controller will misbehave.
   */
  constructor(mock: Mock<F>) {
    let numTracked = 0;
    super((track) => {
      for (; numTracked < mock.mock.calls.length; ++numTracked) {
        track(new TestCall(mock, numTracked));
      }
    });
  }
}
