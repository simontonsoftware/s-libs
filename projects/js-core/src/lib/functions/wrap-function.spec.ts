import { noop } from '@s-libs/micro-dash';
import { expectSingleCallAndReset, staticTest } from '@s-libs/ng-vitest';
import { expectTypeOf } from 'expect-type';
import type { Mock } from 'vitest';
import { wrapFunction } from './wrap-function';

describe('wrapFunction()', () => {
  const context = { context: Symbol('context') };
  const arg1 = Symbol('arg1');
  const arg2 = Symbol('arg2');
  const toReturn = Symbol('toReturn');
  const transformed = Symbol('transformed');
  const aroundContext = { context: Symbol('aroundContext') };
  const aroundArg = Symbol('aroundArg');
  const aroundReturn = Symbol('aroundReturn');

  let original: Mock;
  let around: Mock;
  let before: Mock;
  let transform: Mock;
  let after: Mock;

  beforeEach(() => {
    original = vi.fn().mockReturnValue(toReturn);
    before = vi.fn();
    around = vi.fn().mockImplementation(
      (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        orig: Function,
        ...args: any[]
      ): [any, symbol] => [
        orig.call(aroundContext, aroundArg, ...args),
        aroundReturn,
      ],
    );
    transform = vi.fn().mockReturnValue(transformed);
    after = vi.fn();
  });

  function expectProperCallToOriginal(): void {
    expect(vi.mocked(original).mock.contexts[0]).toBe(context);
    expectSingleCallAndReset(original, arg1, arg2);
  }

  function expectProperCallToBefore(): void {
    expect(vi.mocked(before).mock.contexts[0]).toBe(context);
    expectSingleCallAndReset(before, arg1, arg2);
  }

  function expectProperCallToTransform(): void {
    expect(vi.mocked(transform).mock.contexts[0]).toBe(context);
    expectSingleCallAndReset(transform, toReturn, arg1, arg2);
  }

  function expectProperCallToAfter(result: symbol): void {
    expect(vi.mocked(after).mock.contexts[0]).toBe(context);
    expectSingleCallAndReset(after, result, arg1, arg2);
  }

  function expectProperCallToAround(): void {
    expect(vi.mocked(around).mock.contexts[0]).toBe(context);
    expectSingleCallAndReset(around, original, arg1, arg2);
  }

  function expectAroundedCallToOriginal(): void {
    expect(vi.mocked(original).mock.contexts[0]).toBe(aroundContext);
    expectSingleCallAndReset(original, aroundArg, arg1, arg2);
  }

  function expectAroundedCallToTransform(): void {
    expect(vi.mocked(transform).mock.contexts[0]).toBe(context);
    expectSingleCallAndReset(transform, [toReturn, aroundReturn], arg1, arg2);
  }

  it('runs the before hook', () => {
    const wrapped = wrapFunction(original, { before });

    const returned = wrapped.call(context, arg1, arg2);

    expect(returned).toBe(toReturn);
    expect(
      Math.min(...vi.mocked(before).mock.invocationCallOrder),
    ).toBeLessThan(Math.min(...vi.mocked(original).mock.invocationCallOrder));
    expectProperCallToOriginal();
    expectProperCallToBefore();
  });

  it('runs the around hook', () => {
    const wrapped = wrapFunction(original, { around });

    const returned = wrapped.call(context, arg1, arg2);

    expect(returned).toEqual([toReturn, aroundReturn]);
    expectAroundedCallToOriginal();
    expectProperCallToAround();
  });

  it('runs the transform hook', () => {
    const wrapped = wrapFunction(original, { transform });

    const returned = wrapped.call(context, arg1, arg2);

    expect(returned).toBe(transformed);
    expect(
      Math.min(...vi.mocked(original).mock.invocationCallOrder),
    ).toBeLessThan(Math.min(...vi.mocked(transform).mock.invocationCallOrder));
    expectProperCallToOriginal();
    expectProperCallToTransform();
  });

  it('runs the after hook', () => {
    const wrapped = wrapFunction(original, { after });

    const returned = wrapped.call(context, arg1, arg2);

    expect(returned).toBe(toReturn);
    expect(
      Math.min(...vi.mocked(original).mock.invocationCallOrder),
    ).toBeLessThan(Math.min(...vi.mocked(after).mock.invocationCallOrder));
    expectProperCallToOriginal();
    expectProperCallToAfter(toReturn);
  });

  it('does not require hooks', () => {
    const wrapped = wrapFunction(original, {});

    const returned = wrapped.call(context, arg1, arg2);

    expect(returned).toBe(toReturn);
    expectProperCallToOriginal();
  });

  it('can run all the hooks at once', () => {
    const wrapped = wrapFunction(original, {
      before,
      around,
      transform,
      after,
    });

    const returned = wrapped.call(context, arg1, arg2);

    expect(returned).toBe(transformed);
    expect(
      Math.min(...vi.mocked(before).mock.invocationCallOrder),
    ).toBeLessThan(Math.min(...vi.mocked(original).mock.invocationCallOrder));
    expect(
      Math.min(...vi.mocked(original).mock.invocationCallOrder),
    ).toBeLessThan(Math.min(...vi.mocked(transform).mock.invocationCallOrder));
    expect(
      Math.min(...vi.mocked(transform).mock.invocationCallOrder),
    ).toBeLessThan(Math.min(...vi.mocked(after).mock.invocationCallOrder));
    expectAroundedCallToOriginal();
    expectProperCallToBefore();
    expectProperCallToAround();
    expectAroundedCallToTransform();
    expectProperCallToAfter(transformed);
  });

  it('preserves arity', () => {
    expect(wrapFunction((a: number, b: number) => a + b, {}).length).toBe(2);
  });

  it('has fancy typing', () => {
    staticTest(() => {
      class O {
        id = 1;
      }
      function f(this: O, _a1: string, _a2: Date): number {
        return 1;
      }

      expectTypeOf(wrapFunction(noop, {})).toEqualTypeOf<
        (this: unknown) => void
      >();
      expectTypeOf(wrapFunction(f, {})).toEqualTypeOf<
        (this: O, a1: string, a2: Date) => number
      >();
      wrapFunction(f, {
        // @ts-expect-error wrong "this" type

        before(this: Date, _a1, _a2): void {},
      });
      wrapFunction(
        // @ts-expect-error _orig should return number
        f,
        {
          around(_orig: () => void, _a1, _a2): number {
            return 1;
          },
        },
      );
      wrapFunction(f, {
        // @ts-expect-error should return number
        transform(_r, _a1, _a2): string {
          return '1';
        },
      });
      wrapFunction(f, {
        // @ts-expect-error _a1 should be string

        after(_r, _a1: Date): void {},
      });
    });
  });
});
