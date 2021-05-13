import { Constructor } from './constructor';
import { expectTypeOf } from 'expect-type';

describe('Constructor', () => {
  it('can be used for a mixin pattern', () => {
    expect().nothing();

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
