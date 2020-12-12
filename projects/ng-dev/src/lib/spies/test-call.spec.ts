import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { AsyncMethodController } from './async-method-controller';
import { expectSingleCallAndReset } from './expect-single-call-and-reset';

describe('TestCall', () => {
  describe('.flush()', () => {
    it('causes the call to resolve with the given value', fakeAsync(() => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      const spy = jasmine.createSpy();
      navigator.clipboard.readText().then(spy);
      const testCall = controller.match(() => true)[0];

      testCall.flush('the clipboard text');
      flushMicrotasks();

      expectSingleCallAndReset(spy, 'the clipboard text');
    }));
  });
});
