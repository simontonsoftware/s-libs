import { staticTest } from '@s-libs/ng-dev';
import { Encoding } from './encoding';

describe('Encoding', () => {
  let encoding: Encoding;
  beforeEach(() => {
    encoding = new Encoding();
  });

  describe('push & pull string', () => {
    it('uses the given alphabet', () => {
      encoding.pushString('abc', 'abcd');
      expect(encoding.pullAllAsString('ab')).toBe('bba');
    });

    it('has a nice error when value has a character that is not in the alphabet', () => {
      expect(() => {
        encoding.pushString('ab', 'a');
      }).toThrowError('value contains a character that is not in alphabet: b');
    });
  });

  it('can push and pull booleans', () => {
    encoding.pushBoolean(true);
    encoding.pushBoolean(false);
    expect(encoding.pullBoolean()).toBe(false);
    expect(encoding.pullBoolean()).toBe(true);
  });

  describe('push and pull options', () => {
    it('works', () => {
      encoding.pushOption(4, [2, 4]);
      encoding.pushOption('hi', ['hi', 'there']);
      expect(encoding.pullOption(['hi', 'there'])).toBe('hi');
      expect(encoding.pullOption([2, 4])).toBe(4);
    });

    it('has a nice error when value is not in options', () => {
      expect(() => {
        encoding.pushOption('a', ['b', 'c']);
      }).toThrowError('value (a) not found in options');
    });

    it('accepts readonly arrays', () => {
      staticTest(() => {
        encoding.pushOption(1, [1, 2] as const);
        encoding.pullOption([1, 2] as const);
      });
    });
  });

  describe('push and pull number', () => {
    it('uses the given bounds', () => {
      encoding.pushNumber(8, 5, 11);
      encoding.pushNumber(-2, -9);
      encoding.pushNumber(3, 3);
      expect(encoding.pullNumber(3)).toBe(3);
      expect(encoding.pullNumber(-9)).toBe(-2);
      expect(encoding.pullNumber(5, 11)).toBe(8);
    });

    it('has a nice error message when the value is out of bounds', () => {
      expect(() => {
        encoding.pushNumber(-1, 8);
      }).toThrowError('value (-1) must be at least 0');
      expect(() => {
        encoding.pushNumber(5, 4);
      }).toThrowError('value (5) must be at most 4');
    });
  });

  it('has .hasData()', () => {
    expect(encoding.hasData()).toBe(false);
    encoding.pushBoolean(true);
    expect(encoding.hasData()).toBe(true);
    encoding.pullBoolean();
    expect(encoding.hasData()).toBe(false);
  });

  it('works for the example in the docs', () => {
    const hexAlphabet = '0123456789abcdef';
    const options = ['disagree', 'neutral', 'agree'];

    // encode some survey answers into a hex string
    encoding = new Encoding();
    encoding.pushNumber(5, 1, 5); // encode 5, where it could be between 1-5
    encoding.pushBoolean(true);
    encoding.pushOption('agree', options);
    const hexString = encoding.pullAllAsString(hexAlphabet);
    expect(hexString).toBe('1d');

    // later decode the string back into the survey answers
    encoding = new Encoding();
    encoding.pushString(hexString, hexAlphabet);
    expect(encoding.pullOption(options)).toBe('agree');
    expect(encoding.pullBoolean()).toBe(true);
    expect(encoding.pullNumber(1, 5)).toBe(5);
  });
});
