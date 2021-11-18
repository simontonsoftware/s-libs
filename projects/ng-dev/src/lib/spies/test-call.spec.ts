import { Component, Input } from '@angular/core';
import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { noop } from '@s-libs/micro-dash';
import { ComponentContext } from '../component-context';
import { AsyncMethodController } from './async-method-controller';
import { expectSingleCallAndReset } from './expect-single-call-and-reset';

describe('TestCall', () => {
  @Component({ template: 'Hello, {{name}}!' })
  class TestComponent {
    @Input() name!: string;
  }

  describe('.callInfo', () => {
    it('is populated with a jasmine.CallInfo object', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      navigator.clipboard.readText();

      const { callInfo } = controller.expectOne([]);

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

    it('triggers a tick if appropriate', () => {
      const ctx = new ComponentContext(TestComponent);
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      ctx.run(() => {
        navigator.clipboard.readText();
        const testCall = controller.expectOne([]);

        ctx.getComponentInstance().name = 'Changed Guy';
        testCall.flush('this is the clipboard content');
        expect(ctx.fixture.nativeElement.textContent).toContain('Changed Guy');
      });
    });
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

    it('triggers a tick if appropriate', () => {
      const ctx = new ComponentContext(TestComponent);
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      ctx.run(() => {
        navigator.clipboard.readText().catch(noop);
        const testCall = controller.expectOne([]);

        ctx.getComponentInstance().name = 'Changed Guy';
        testCall.error('permission denied');
        expect(ctx.fixture.nativeElement.textContent).toContain('Changed Guy');
      });
    });
  });

  describe('.maybeTick()', () => {
    it('does not call .tick() when autoTick is false', () => {
      const ctx = new ComponentContext(TestComponent);
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
        { autoTick: false },
      );

      ctx.run(() => {
        navigator.clipboard.readText();
        ctx.getComponentInstance().name = 'Spy';
        controller.expectOne([]).flush('this is the clipboard content');

        expect(ctx.fixture.nativeElement.textContent).not.toContain('Spy');
      });
    });

    it('gracefully handles being run outside an AngularContext', () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      navigator.clipboard.readText();
      expect(() => {
        controller.expectOne([]).flush('this is the clipboard content');
      }).not.toThrowError();
    });
  });
});
