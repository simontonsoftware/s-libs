import { times } from './times';

describe('times()', () => {
  it('handles n=0', () => {
    const logger = jasmine.createSpy();

    const result = times(0, logger);

    expect(result).toEqual([]);
    expect(logger.calls.allArgs()).toEqual([]);
  });

  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should provide correct `iteratee` arguments', () => {
    const logger = jasmine.createSpy();

    times(1, logger);

    expect(logger.calls.allArgs()).toEqual([[0]]);
  });

  it('should return an array of the results of each `iteratee` execution', () => {
    expect(times(3, (i) => 2 * i)).toEqual([0, 2, 4]);
  });
});
