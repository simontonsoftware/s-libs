import { describe, expect, it } from 'vitest';
import { expectExactContents } from './expect-exact-contents';

describe('expectExactContents()', () => {
  it('passes when the contents are the same', () => {
    expect(() => {
      expectExactContents(['a', 'b'], ['b', 'a']);
    }).not.toThrow();
  });

  it('fails when the length is different', () => {
    expect(() => {
      expectExactContents(['a', 'a'], ['a']);
    }).toThrow();
  });

  it('fails when the contents are different', () => {
    expect(() => {
      expectExactContents(['a', 'b'], ['a', 'c']);
    }).toThrow();
  });

  it('works with matchers', () => {
    expect(() => {
      expectExactContents(['abc', 'def'], [expect.stringMatching(/a/u), 'def']);
    }).not.toThrow();
  });

  it('handles empty arrays', () => {
    expect(() => {
      expectExactContents([], []);
    }).not.toThrow();
    expect(() => {
      expectExactContents([], ['a']);
    }).toThrow();
    expect(() => {
      expectExactContents(['a'], []);
    }).toThrow();
  });

  it('works for the example in the docs', () => {
    expectExactContents([1, 2, 3], [3, 2, 1]);
    expectExactContents(['abc'], [expect.stringMatching('bc')]);
  });
});
