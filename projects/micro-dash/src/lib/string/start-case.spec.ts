import { startCase } from './start-case';

describe('startCase()', () => {
  //
  // stolen from https://github.com/lodash/lodash
  //

  it('should uppercase only the first character of each word', () => {
    expect(startCase('--foo-bar--')).toBe('Foo Bar');
    expect(startCase('fooBar')).toBe('Foo Bar');
    expect(startCase('__FOO_BAR__')).toBe('FOO BAR');
  });

  it('should convert `string` to start case', () => {
    const strings = [
      'foo bar',
      'Foo bar',
      'foo Bar',
      'Foo Bar',
      'FOO BAR',
      'fooBar',
      '--foo-bar--',
      '__foo_bar__',
    ];

    for (const str of strings) {
      if (str === 'FOO BAR') {
        expect(startCase(str)).toBe('FOO BAR');
      } else {
        expect(startCase(str)).toBe('Foo Bar');
      }
    }
  });

  it('should handle double-converting strings', () => {
    const strings = [
      'foo bar',
      'Foo bar',
      'foo Bar',
      'Foo Bar',
      'FOO BAR',
      'fooBar',
      '--foo-bar--',
      '__foo_bar__',
    ];

    for (const str of strings) {
      if (str === 'FOO BAR') {
        expect(startCase(startCase(str))).toBe('FOO BAR');
      } else {
        expect(startCase(startCase(str))).toBe('Foo Bar');
      }
    }
  });

  it('should remove Latin mathematical operators', () => {
    expect(startCase('\xd7')).toBe('');
    expect(startCase('\xf7')).toBe('');
  });

  it('should return an empty string for empty values', () => {
    expect(startCase('')).toBe('');
  });
});
