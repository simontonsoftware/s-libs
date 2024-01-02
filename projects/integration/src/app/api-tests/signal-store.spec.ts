import { PersistentStore, RootStore, Store } from '@s-libs/signal-store';

describe('signal-store', () => {
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
