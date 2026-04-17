import {
  AngularContext,
  AsyncMethodController,
  ComponentContext,
  ComponentHarnessSuperclass,
  createSpyObject,
  expectCallsAndReset,
  expectRequest,
  expectSingleCallAndReset,
  IsPageVisibleHarness,
  SlTestRequest,
  TestCall,
} from '@s-libs/ng-jasmine';

describe('ng-dev', () => {
  it('has AngularContext', () => {
    expect(AngularContext).toBeDefined();
  });

  it('has AsyncMethodController', () => {
    expect(AsyncMethodController).toBeDefined();
  });

  it('has ComponentContext', () => {
    expect(ComponentContext).toBeDefined();
  });

  it('has ComponentHarnessSuperclass', () => {
    expect(ComponentHarnessSuperclass).toBeDefined();
  });

  it('has IsPageVisibleHarness', () => {
    expect(IsPageVisibleHarness).toBeDefined();
  });

  it('has TestCall', () => {
    expect(TestCall).toBeDefined();
  });

  it('has SlTestRequest', () => {
    expect(SlTestRequest).toBeDefined();
  });

  it('has createSpyObject()', () => {
    expect(createSpyObject).toBeDefined();
  });

  it('has expectCallsAndReset()', () => {
    expect(expectCallsAndReset).toBeDefined();
  });

  it('has expectRequest()', () => {
    expect(expectRequest).toBeDefined();
  });

  it('has expectSingleCallAndReset()', () => {
    expect(expectSingleCallAndReset).toBeDefined();
  });
});
