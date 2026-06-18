import { expectSingleCallAndReset } from './expect-single-call-and-reset';

describe('expectSingleCallAndReset()', () => {
  it('matches arguments', () => {
    const mock = vi.fn();

    mock('a thing', 'or two');
    expectSingleCallAndReset(mock, 'a thing', 'or two');

    mock();
    expectSingleCallAndReset(mock);
  });

  it('resets the mock', () => {
    const mock = vi.fn();

    mock();
    expectSingleCallAndReset(mock);
    expect(mock).not.toHaveBeenCalled();

    mock(1);
    expectSingleCallAndReset(mock, 1);
    expect(mock).not.toHaveBeenCalled();
  });

  it('requires exactly one call', () => {
    const mock = vi.fn();
    expect(() => {
      expectSingleCallAndReset(mock);
    }).toThrow();

    mock();
    mock();
    expect(() => {
      expectSingleCallAndReset(mock);
    }).toThrow();
  });
});
