import {
  logTimers,
  marbleTest,
  MockErrorHandler,
  staticTest,
} from '@s-libs/ng-dev';

describe('ng-dev', () => {
  it('has MockErrorHandler', () => {
    expect(MockErrorHandler).toBeDefined();
  });

  it('has logTimers()', () => {
    expect(logTimers).toBeDefined();
  });

  it('has marbleTest', () => {
    expect(marbleTest).toBeDefined();
  });

  it('has staticTest', () => {
    expect(staticTest).toBeDefined();
  });
});
