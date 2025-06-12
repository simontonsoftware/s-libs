import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { Constructor } from './constructor';

describe('Constructor', () => {
  it('can be used for a mixin pattern', () => {
    staticTest(() => {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- showing the types are correctly inferred is part of the point of this test
      function mixInSomething<B extends Constructor>(Base: B) {
        return class extends Base {
          something = true;
        };
      }

      class DateSomething extends mixInSomething(Date) {}

      expectTypeOf<DateSomething>().toExtend<Date>();
      expectTypeOf<DateSomething>().toExtend<{ something: boolean }>();
    });
  });
});
