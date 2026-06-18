import {
  AngularContext,
  arrayWithMatch,
  AsyncMethodController,
  AsyncTestCall,
  ComponentContext,
  ComponentHarnessSuperclass,
  createMockObject,
  expectExactContents,
  expectRequest,
  expectSingleCallAndReset,
  MockController,
  SlTestRequest,
  staticTest,
  TestCall,
} from '@s-libs/ng-vitest';

describe('ng-vitest', () => {
  it('has AngularContext', () => {
    expect(AngularContext).toBeDefined();
  });

  it('has AsyncMethodController', () => {
    expect(AsyncMethodController).toBeDefined();
  });

  it('has AsyncTestCall', () => {
    expect(AsyncTestCall).toBeDefined();
  });

  it('has ComponentContext', () => {
    expect(ComponentContext).toBeDefined();
  });

  it('has ComponentHarnessSuperclass', () => {
    expect(ComponentHarnessSuperclass).toBeDefined();
  });

  it('has MockController', () => {
    expect(MockController).toBeDefined();
  });

  it('has TestCall', () => {
    expect(TestCall).toBeDefined();
  });

  it('has SlTestRequest', () => {
    expect(SlTestRequest).toBeDefined();
  });

  it('has arrayWithMatch()', () => {
    expect(arrayWithMatch).toBeDefined();
  });

  it('has createMockObject()', () => {
    expect(createMockObject).toBeDefined();
  });

  it('has expectExactContents()', () => {
    expect(expectExactContents).toBeDefined();
  });

  it('has expectRequest()', () => {
    expect(expectRequest).toBeDefined();
  });

  it('has expectSingleCallAndReset()', () => {
    expect(expectSingleCallAndReset).toBeDefined();
  });

  it('has staticTest', () => {
    expect(staticTest).toBeDefined();
  });
});
