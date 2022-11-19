import { expectSingleCallAndReset, staticTest } from '@s-libs/ng-dev';
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

  let original: jasmine.Spy;
  let around: jasmine.Spy;
  let before: jasmine.Spy;
  let transform: jasmine.Spy;
  let after: jasmine.Spy;

  beforeEach(() => {
    original = jasmine.createSpy().and.returnValue(toReturn);
    before = jasmine.createSpy();
    around = jasmine.createSpy().and.callFake(
      (
        // eslint-disable-next-line @typescript-eslint/ban-types
        orig: Function,
        ...args: any[]
      ): [any, symbol] => [
        orig.call(aroundContext, aroundArg, ...args),
        aroundReturn,
      ],
    );
    transform = jasmine.createSpy().and.returnValue(transformed);
    after = jasmine.createSpy();
  });

  function expectProperCallToOriginal(): void {
    expect(original.calls.first().object).toBe(context);
    expectSingleCallAndReset(original, arg1, arg2);
  }

  function expectProperCallToBefore(): void {
    expect(before.calls.first().object).toBe(context);
    expectSingleCallAndReset(before, arg1, arg2);
  }

  function expectProperCallToTransform(): void {
    expect(transform.calls.first().object).toBe(context);
    expectSingleCallAndReset(transform, toReturn, arg1, arg2);
  }

  function expectProperCallToAfter(result: symbol): void {
    expect(after.calls.first().object).toBe(context);
    expectSingleCallAndReset(after, result, arg1, arg2);
  }

  function expectProperCallToAround(): void {
    expect(around.calls.first().object).toBe(context);
    expectSingleCallAndReset(around, original, arg1, arg2);
  }

  function expectAroundedCallToOriginal(): void {
    expect(original.calls.first().object).toBe(aroundContext);
    expectSingleCallAndReset(original, aroundArg, arg1, arg2);
  }

  function expectAroundedCallToTransform(): void {
    expect(transform.calls.first().object).toBe(context);
    expectSingleCallAndReset(transform, [toReturn, aroundReturn], arg1, arg2);
  }

  it('runs the before hook', () => {
    const wrapped = wrapFunction(original, { before });

    const returned = wrapped.call(context, arg1, arg2);

    expect(returned).toBe(toReturn);
    expect(before).toHaveBeenCalledBefore(original);
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
    expect(original).toHaveBeenCalledBefore(transform);
    expectProperCallToOriginal();
    expectProperCallToTransform();
  });

  it('runs the after hook', () => {
    const wrapped = wrapFunction(original, { after });

    const returned = wrapped.call(context, arg1, arg2);

    expect(returned).toBe(toReturn);
    expect(original).toHaveBeenCalledBefore(after);
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
    expect(before).toHaveBeenCalledBefore(original);
    expect(original).toHaveBeenCalledBefore(transform);
    expect(transform).toHaveBeenCalledBefore(after);
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
