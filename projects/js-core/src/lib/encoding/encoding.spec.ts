import { staticTest } from '@s-libs/ng-dev';
import { Encoding } from './encoding';

// TODO: error message pushing non-integer
// TODO: handle pushing with 1 option, or alphabet of length 1
// TODO: handle/error/test alphabet of length 0

describe('Encoding', () => {
  let encoding: Encoding;
  beforeEach(() => {
    encoding = new Encoding();
  });

  it('can do string encodings', () => {
    encoding.pushNaturalNumber(1);
    encoding.setStringEncoding('abc', 'abcd');
    expect(encoding.popStringEncoding('ab')).toBe('bba');
  });

  it('can do bigint encodings', () => {
    encoding.pushNaturalNumber(1);
    encoding.setBigintEncoding(123n);
    expect(encoding.popBigintEncoding()).toBe(123n);
  });

  it('can do strings', () => {
    encoding.pushString('abc', 'abcd');
    expect(encoding.popString(3, 'abcd')).toBe('abc');
  });

  it('can do unbounded integers', () => {
    encoding.pushUnboundedInt(-51375);
    encoding.pushUnboundedInt(0);
    encoding.pushUnboundedInt(61);
    expect(encoding.popUnboundedInt()).toBe(61);
    expect(encoding.popUnboundedInt()).toBe(0);
    expect(encoding.popUnboundedInt()).toBe(-51375);
  });

  describe('natural numbers', () => {
    it('can do natural numbers', () => {
      encoding.pushNaturalNumber(42);
      encoding.pushNaturalNumber(16548);
      encoding.pushNaturalNumber(0);
      expect(encoding.popNaturalNumber()).toBe(0);
      expect(encoding.popNaturalNumber()).toBe(16548);
      expect(encoding.popNaturalNumber()).toBe(42);
    });

    it('has a nice error for illegal input', () => {
      expect(() => {
        encoding.pushNaturalNumber(0.5);
      }).toThrowError('value (0.5) must be a natural number');
      expect(() => {
        encoding.pushNaturalNumber(-1);
      }).toThrowError('value (-1) must be a natural number');
    });
  });

  it('can do booleans', () => {
    encoding.pushBoolean(true);
    encoding.pushBoolean(false);
    expect(encoding.popBoolean()).toBe(false);
    expect(encoding.popBoolean()).toBe(true);
  });

  describe('do options', () => {
    it('works', () => {
      encoding.pushOption(4, [2, 4]);
      encoding.pushOption('hi', ['hi', 'there']);
      expect(encoding.popOption(['hi', 'there'])).toBe('hi');
      expect(encoding.popOption([2, 4])).toBe(4);
    });

    it('has a nice error when value is not in options', () => {
      expect(() => {
        encoding.pushOption('a', ['b', 'c']);
      }).toThrowError('value (a) not found in options');
    });

    it('accepts readonly arrays', () => {
      staticTest(() => {
        encoding.pushOption(1, [1, 2] as const);
        encoding.popOption([1, 2] as const);
      });
    });
  });

  describe('do integers', () => {
    it('uses the given bounds', () => {
      encoding.pushInteger(8, 5, 11);
      encoding.pushInteger(-2, -9);
      encoding.pushInteger(3, 3);
      expect(encoding.popInteger(3)).toBe(3);
      expect(encoding.popInteger(-9)).toBe(-2);
      expect(encoding.popInteger(5, 11)).toBe(8);
    });

    it('has nice error messages for illegal input', () => {
      expect(() => {
        encoding.pushInteger(0.5, 1);
      }).toThrowError('value (0.5) must be an integer');
      expect(() => {
        encoding.pushInteger(-1, 8);
      }).toThrowError('value (-1) must be at least 0');
      expect(() => {
        encoding.pushInteger(5, 4);
      }).toThrowError('value (5) must be at most 4');
    });
  });

  it('has .hasData()', () => {
    expect(encoding.hasData()).toBe(false);
    encoding.pushBoolean(true);
    expect(encoding.hasData()).toBe(true);
    encoding.popBoolean();
    expect(encoding.hasData()).toBe(false);
  });

  it('has a nice error when pushing a character that is not in the alphabet', () => {
    expect(() => {
      encoding.setStringEncoding('ab', 'a');
    }).toThrowError('value contains a character that is not in alphabet: b');
  });

  it('works for the example in the docs', () => {
    const hexAlphabet = '0123456789abcdef';
    const options = ['disagree', 'neutral', 'agree'];

    // encode some survey answers into a hex string
    encoding = new Encoding();
    encoding.pushInteger(5, 1, 5); // encode 5, where it could be between 1-5
    encoding.pushBoolean(true);
    encoding.pushOption('agree', options);
    const hexString = encoding.popStringEncoding(hexAlphabet);
    expect(hexString).toBe('1d');

    // later decode the string back into the survey answers
    encoding = new Encoding();
    encoding.setStringEncoding(hexString, hexAlphabet);
    expect(encoding.popOption(options)).toBe('agree');
    expect(encoding.popBoolean()).toBe(true);
    expect(encoding.popInteger(1, 5)).toBe(5);
  });
});
