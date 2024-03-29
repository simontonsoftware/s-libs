import { Constructor } from './constructor';
import { expectTypeOf } from 'expect-type';

describe('Constructor', () => {
  it('can be used for a mixin pattern', () => {
    expect().nothing();

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- showing the types are correctly inferred is part of the point of this test
    function mixInSomething<B extends Constructor>(Base: B) {
      return class extends Base {
        something = true;
      };
    }
    class DateSomething extends mixInSomething(Date) {}
    expectTypeOf<DateSomething>().toMatchTypeOf<Date>();
    expectTypeOf<DateSomething>().toMatchTypeOf<{ something: boolean }>();
  });
});
