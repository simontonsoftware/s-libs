import { expectCallsAndReset } from './expect-calls-and-reset';

describe('expectCallsAndReset()', () => {
  it('matches arguments', () => {
    const mock = vi.fn();

    mock('a thing', 'or two');
    expectCallsAndReset(mock, ['a thing', 'or two']);

    mock();
    expectCallsAndReset(mock, []);

    mock(1);
    mock(2);
    mock(3, 4);
    expectCallsAndReset(mock, [1], [2], [3, 4]);
  });

  it('resets the mock', () => {
    const mock = vi.fn();

    mock();
    expectCallsAndReset(mock, []);
    expect(mock).not.toHaveBeenCalled();

    mock(1);
    expectCallsAndReset(mock, [1]);
    expect(mock).not.toHaveBeenCalled();
  });
});
