import {
  EffectRef,
  Injector,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { Deferred } from '@s-libs/js-core';
import { noop } from '@s-libs/micro-dash';
import { AngularContext, expectSingleCallAndReset } from '@s-libs/ng-vitest';
import { debounceWhileHandling } from './debounce-while-handling';

describe('debounceWhileHandling()', () => {
  class TestContext extends AngularContext {
    handle = vi.fn().mockResolvedValue(undefined);
    effectRef!: EffectRef;
    readonly #input = signal(0);

    override async init(): Promise<void> {
      runInInjectionContext(this.inject(Injector), () => {
        this.effectRef = debounceWhileHandling(this.#input, this.handle);
      });
      await super.init();
      await this.tick();
      expectSingleCallAndReset(this.handle, 0);
    }

    async setInput(value: number): Promise<void> {
      this.#input.set(value);
      await this.tick();
    }
  }

  it('calls the handler when input changes', async () => {
    const ctx = new TestContext();
    await ctx.run(async () => {
      await ctx.setInput(1);
      expectSingleCallAndReset(ctx.handle, 1);
    });
  });

  it('debounces while the last handler is running', async () => {
    const ctx = new TestContext();
    const deferred = new Deferred<void>();
    ctx.handle.mockReturnValue(deferred.promise);
    await ctx.run(async () => {
      await ctx.setInput(1);
      await ctx.setInput(2);
      expect(ctx.handle).not.toHaveBeenCalled();

      deferred.resolve();
      await ctx.tick();
      expectSingleCallAndReset(ctx.handle, 2);
    });
  });

  it('continues trying after errors', async () => {
    window.addEventListener('unhandledrejection', noop);

    const ctx = new TestContext();
    ctx.handle.mockRejectedValue('no');
    await ctx.run(async () => {
      await ctx.setInput(1);
      expect(ctx.handle).toHaveBeenCalled();
    });

    window.removeEventListener('unhandledrejection', noop);
  });

  it('can be cancelled', async () => {
    const ctx = new TestContext();
    await ctx.run(async () => {
      ctx.effectRef.destroy();
      await ctx.setInput(1);
      expect(ctx.handle).not.toHaveBeenCalled();
    });
  });
});
