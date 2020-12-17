import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { AsyncMethodController } from './async-method-controller';
import { expectSingleCallAndReset } from './expect-single-call-and-reset';

describe('TestCall', () => {
  describe('.callInfo', () => {
    it('is populated with a jasmine.CallInfo object', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      navigator.clipboard.readText();

      const callInfo = controller.expectOne([]).callInfo;

      // We'd love to test that this is just an "instanceof jasmine.CallInfo", but that's not really a thing. So we'll approximate it by ensuring a couple properties exist.
      expect(callInfo.returnValue).toBeInstanceOf(Promise);
      expect(callInfo.object).toBe(navigator.clipboard);
    });
  });

  describe('.flush()', () => {
    it('causes the call to be fulfilled with the given value', fakeAsync(() => {
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

  describe('.error()', () => {
    it('causes the call to be rejected with the given reason', fakeAsync(() => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      const spy = jasmine.createSpy();
      navigator.clipboard.readText().catch(spy);
      const testCall = controller.match(() => true)[0];

      testCall.error('some problem');
      flushMicrotasks();

      expectSingleCallAndReset(spy, 'some problem');
    }));
  });
});
