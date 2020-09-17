import { expectSingleCallAndReset } from './expect-single-call-and-reset';

describe('expectSingleCallAndReset()', () => {
  it('matches arguments', () => {
    const spy = jasmine.createSpy();

    spy('a thing', 'or two');
    expectSingleCallAndReset(spy, 'a thing', 'or two');

    spy();
    expectSingleCallAndReset(spy);
  });

  it('resets the spy', () => {
    const spy = jasmine.createSpy();

    spy();
    expectSingleCallAndReset(spy);
    expect(spy).not.toHaveBeenCalled();

    spy(1);
    expectSingleCallAndReset(spy, 1);
    expect(spy).not.toHaveBeenCalled();
  });
});
