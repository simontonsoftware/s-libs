import { randomString } from './random-string';

describe('randomString()', () => {
  it('returns a string of the given length', () => {
    expect(randomString(10).length).toBe(10);
    expect(randomString(1).length).toBe(1);
    expect(randomString(0).length).toBe(0);
  });

  it('has random contents', () => {
    expect(randomString(10)).not.toEqual(randomString(10));
  });
});
