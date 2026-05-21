import { noop } from '@s-libs/micro-dash';
import { staticTest } from './static-test';

let curSpec!: jasmine.SpecResult;
jasmine.getEnv().addReporter({
  specStarted(result) {
    curSpec = result;
  },
});

describe('testTyping()', () => {
  it('satisfies jasmine that the test expects something', () => {
    staticTest(noop);
    expect(curSpec.passedExpectations.length).toBe(1);
  });

  it('does not execute the code', () => {
    staticTest(() => {
      fail('this should not run');
    });
  });

  describe('example from the docs', () => {
    function reject<T>(array: T[], predicate: (value: T) => boolean): T[] {
      return array.filter((value) => !predicate(value));
    }

    it('requires the predicate type to match the array type', () => {
      staticTest(() => {
        // @ts-expect-error -- mismatch of number array w/ string function
        reject([1, 2, 3], (value: string) => value === '2');
      });
    });
  });
});
