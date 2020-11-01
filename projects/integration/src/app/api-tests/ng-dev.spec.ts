import {
  AngularContext,
  ComponentContext,
  createSpyObject,
  expectCallsAndReset,
  expectSingleCallAndReset,
  logTimers,
  marbleTest,
  precompileForTests,
  trimLeftoverStyles,
} from '@s-libs/ng-dev';

describe('ng-dev', () => {
  it('has AngularContext', () => {
    expect(AngularContext).toBeDefined();
  });

  it('has ComponentContext', () => {
    expect(ComponentContext).toBeDefined();
  });

  it('has createSpyObject()', () => {
    expect(createSpyObject).toBeDefined();
  });

  it('has expectCallsAndReset()', () => {
    expect(expectCallsAndReset).toBeDefined();
  });

  it('has expectSingleCallAndReset()', () => {
    expect(expectSingleCallAndReset).toBeDefined();
  });

  it('has logTimers()', () => {
    expect(logTimers).toBeDefined();
  });

  it('has marbleTest', () => {
    expect(marbleTest).toBeDefined();
  });

  it('has precompileForTests()', () => {
    expect(precompileForTests).toBeDefined();
  });

  it('has trimLeftoverStyles()', () => {
    expect(trimLeftoverStyles).toBeDefined();
  });
});
