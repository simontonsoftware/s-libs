import {
  PersistentStore,
  RootStore,
  Store,
  spreadArrayStore,
  pushToArrayStore,
} from '@s-libs/signal-store';

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

  it('has spreadArrayStore()', () => {
    expect(spreadArrayStore).toBeDefined();
  });

  it('has pushToArrayStore()', () => {
    expect(pushToArrayStore).toBeDefined();
  });
});
