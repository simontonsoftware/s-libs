import { expectTypeOf } from 'expect-type';
import { MockResult, MockSettledResult } from 'vitest';
import { staticTest } from '../static-test/static-test';
import { MockController } from './mock-controller';

describe('TestCall', () => {
  it('has fancy typing', () => {
    staticTest(() => {
      const controller = new MockController(
        vi.fn<(this: URL, arg: string) => Date>(),
      );
      const testCall = controller.expectOne(['']);

      expectTypeOf(testCall.getArgs()).toEqualTypeOf<[string]>();
      expectTypeOf(testCall.getInstance()).toEqualTypeOf<URL>();
      expectTypeOf(testCall.getContext()).toEqualTypeOf<URL>();
      expectTypeOf(testCall.getResult()).toEqualTypeOf<MockResult<Date>>();
      expectTypeOf(testCall.getSettledResult()).toEqualTypeOf<
        MockSettledResult<Date>
      >();
    });
  });
});
