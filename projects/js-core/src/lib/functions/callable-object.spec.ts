import { CallableObject } from './callable-object';

class Multiplier extends CallableObject<(value: number) => number> {
  constructor(public factor: number) {
    super((value: number) => value * this.factor);
  }
}

describe('CallableObject', () => {
  it('is callable', () => {
    const multiplier = new Multiplier(2);
    expect(multiplier(2)).toBe(4);
    expect(multiplier(3)).toBe(6);
  });

  it('still has remaining typings', () => {
    const multiplier = new Multiplier(2);
    expect(multiplier(2)).toBe(4);

    multiplier.factor = 3;
    expect(multiplier(2)).toBe(6);
  });
});
