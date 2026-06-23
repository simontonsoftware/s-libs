import { arrayWithMatch } from './array-with-match';

describe('arrayWithMatch()', () => {
  it('works with a substring', () => {
    // matches
    expect(['abc', 'def']).toEqual(arrayWithMatch('a'));
    expect(['abc', 'def']).toEqual(arrayWithMatch('f'));
    expect(['abc', 'def']).toEqual(arrayWithMatch('abc'));

    // non-matches
    expect(['abc', 'def']).not.toEqual(arrayWithMatch('g'));
    expect(['abc', 'def']).not.toEqual(arrayWithMatch('cd'));
    expect(['abc', 'def']).not.toEqual(arrayWithMatch('bca'));
  });

  it('works with a regex', () => {
    expect(['abc', 'def']).toEqual(arrayWithMatch(/b/u));
    expect(['abc', 'def']).not.toEqual(arrayWithMatch(/g/u));
  });

  it('does not match an empty array', () => {
    expect([]).not.toEqual(arrayWithMatch('a'));
  });

  it('handles empty strings', () => {
    expect(['']).toEqual(arrayWithMatch(''));
    expect(['a']).toEqual(arrayWithMatch(''));
    expect([]).not.toEqual(arrayWithMatch(''));
  });

  it('works for the example in the docs', () => {
    expect(['abc', 'def']).toEqual(arrayWithMatch('b'));
    expect(['abc', 'def']).toEqual(arrayWithMatch(/de/u));
  });
});
