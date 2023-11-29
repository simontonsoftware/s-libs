import { PersistentStore, RootStore, Store } from '@s-libs/ng-signal-state';

describe('ng-signal-state', () => {
  it('has PersistentStore', () => {
    expect(PersistentStore).toBeDefined();
  });

  it('has RootStore', () => {
    expect(RootStore).toBeDefined();
  });

  it('has Store', () => {
    expect(Store).toBeDefined();
  });
});
