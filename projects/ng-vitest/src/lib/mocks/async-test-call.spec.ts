import { noop } from '@s-libs/micro-dash';
import { expectTypeOf } from 'expect-type';
import { AngularContext } from '../angular-context';
import { staticTest } from '../static-test/static-test';
import { AsyncMethodController } from './async-method-controller';
import { expectSingleCallAndReset } from './expect-single-call-and-reset';

describe('AsyncTestCall', () => {
  class TickDetector extends AngularContext {
    ticked = false;

    constructor() {
      super();
      setTimeout(() => {
        this.ticked = true;
      });
    }
  }

  function triggerRead(): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    navigator.clipboard.readText();
  }

  describe('.flush()', () => {
    it('causes the call to be fulfilled with the given value', async () => {
      vi.useFakeTimers();

      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      const mock = vi.fn();
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      navigator.clipboard.readText().then(mock);
      const testCall = controller.match(() => true)[0];

      await testCall.flush('the clipboard text');
      await vi.advanceTimersByTimeAsync(0);

      expectSingleCallAndReset(mock, 'the clipboard text');

      vi.useRealTimers();
    });

    it('triggers a tick', async () => {
      const ctx = new TickDetector();
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      await ctx.run(async () => {
        triggerRead();
        await controller.expectOne([]).flush('this is the clipboard content');
        expect(ctx.ticked).toBe(true);
      });
    });

    it('gracefully handles being run outside an AngularContext', async () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      triggerRead();
      await expect(
        controller.expectOne([]).flush('this is the clipboard content'),
      ).resolves.not.toThrow();
    });
  });

  describe('.error()', () => {
    it('causes the call to be rejected with the given reason', async () => {
      vi.useFakeTimers();

      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );
      const mock = vi.fn<(e: unknown) => void>();
      navigator.clipboard.readText().catch(mock);
      const testCall = controller.match(() => true)[0];

      await testCall.error('some problem');
      await vi.advanceTimersByTimeAsync(0);

      expectSingleCallAndReset(mock, 'some problem');

      vi.useRealTimers();
    });

    it('triggers a tick', async () => {
      const ctx = new TickDetector();
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      await ctx.run(async () => {
        navigator.clipboard.readText().catch(noop);
        await controller.expectOne([]).error('permission denied');
        expect(ctx.ticked).toBe(true);
      });
    });

    it('gracefully handles being run outside an AngularContext', async () => {
      const controller = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      navigator.clipboard.readText().catch(noop);
      await expect(
        controller.expectOne([]).error('permission denied'),
      ).resolves.not.toThrow();
    });
  });

  it('has fancy typing', () => {
    staticTest(() => {
      const writeController = new AsyncMethodController(
        navigator.clipboard,
        'writeText',
      );
      const readController = new AsyncMethodController(
        navigator.clipboard,
        'readText',
      );

      const writeTestCall = writeController.expectOne(['something I copied']);
      const readTestCall = readController.expectOne([]);

      expectTypeOf(writeTestCall.flush).toEqualTypeOf<
        // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
        (value: void) => Promise<void>
      >();
      expectTypeOf(readTestCall.flush).toEqualTypeOf<
        (value: string) => Promise<void>
      >();
    });
  });
});
