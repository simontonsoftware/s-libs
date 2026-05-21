import { logTimers, marbleTest, MockErrorHandler } from '@s-libs/ng-dev';

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
});
