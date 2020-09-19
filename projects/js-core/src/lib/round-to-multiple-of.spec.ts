import { roundToMultipleOf } from './round-to-multiple-of';

describe('roundToMultiple()', () => {
  it('works for whole numbers', () => {
    expect(roundToMultipleOf(2, 0)).toBe(0);
    expect(roundToMultipleOf(2, 1)).toBe(2);
    expect(roundToMultipleOf(2, 2)).toBe(2);
    expect(roundToMultipleOf(2, 3)).toBe(4);
    expect(roundToMultipleOf(2, 4)).toBe(4);

    expect(roundToMultipleOf(3, 1)).toBe(0);
    expect(roundToMultipleOf(3, 2)).toBe(3);
    expect(roundToMultipleOf(3, 3)).toBe(3);
    expect(roundToMultipleOf(3, 4)).toBe(3);
    expect(roundToMultipleOf(3, 5)).toBe(6);
    expect(roundToMultipleOf(3, 6)).toBe(6);
  });

  it('works with fractional values', () => {
    expect(roundToMultipleOf(3, 1.4)).toBe(0);
    expect(roundToMultipleOf(3, 1.5)).toBe(3);
  });

  it('works with negative values', () => {
    expect(roundToMultipleOf(2, -0)).toBe(0);
    expect(roundToMultipleOf(2, -1)).toBe(0);
    expect(roundToMultipleOf(2, -2)).toBe(-2);
    expect(roundToMultipleOf(2, -3)).toBe(-2);
    expect(roundToMultipleOf(2, -4)).toBe(-4);

    expect(roundToMultipleOf(3, -1)).toBe(0);
    expect(roundToMultipleOf(3, -2)).toBe(-3);
    expect(roundToMultipleOf(3, -3)).toBe(-3);
    expect(roundToMultipleOf(3, -4)).toBe(-3);
    expect(roundToMultipleOf(3, -5)).toBe(-6);
    expect(roundToMultipleOf(3, -6)).toBe(-6);
  });

  it('works with fractional multiples', () => {
    expect(roundToMultipleOf(0.5, 1.24)).toBe(1);
    expect(roundToMultipleOf(0.5, 1.25)).toBe(1.5);

    expect(roundToMultipleOf(0.5, -1.25)).toBe(-1);
    expect(roundToMultipleOf(0.5, -1.26)).toBe(-1.5);
  });
});
