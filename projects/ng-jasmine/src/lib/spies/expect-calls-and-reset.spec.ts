import { expectCallsAndReset } from './expect-calls-and-reset';

describe('expectCallsAndReset()', () => {
  it('matches arguments', () => {
    const spy = jasmine.createSpy();

    spy('a thing', 'or two');
    expectCallsAndReset(spy, ['a thing', 'or two']);

    spy();
    expectCallsAndReset(spy, []);

    spy(1);
    spy(2);
    spy(3, 4);
    expectCallsAndReset(spy, [1], [2], [3, 4]);
  });

  it('resets the spy', () => {
    const spy = jasmine.createSpy();

    spy();
    expectCallsAndReset(spy, []);
    expect(spy).not.toHaveBeenCalled();

    spy(1);
    expectCallsAndReset(spy, [1]);
    expect(spy).not.toHaveBeenCalled();
  });
});
