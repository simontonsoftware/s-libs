import { staticTest } from './static-test';

describe('staticTest()', () => {
  it('does not execute the code', () => {
    staticTest(() => {
      assert.fail('this should not run');
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
