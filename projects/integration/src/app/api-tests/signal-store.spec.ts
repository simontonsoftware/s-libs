import { staticTest } from '@s-libs/ng-dev';
import {
  DetachedStore,
  PersistentStore,
  pushToArrayStore,
  RootStore,
  spreadArrayStore,
  spreadArrayStoreSignal,
  Store,
} from '@s-libs/signal-store';
import { expectTypeOf } from 'expect-type';

describe('signal-store', () => {
  it('has DetachedStore', () => {
    expect(DetachedStore).toBeDefined();
  });

  it('has PersistentStore', () => {
    expect(PersistentStore).toBeDefined();
  });

  it('has RootStore', () => {
    expect(RootStore).toBeDefined();
  });

  it('has Store', () => {
    staticTest(() => {
      expectTypeOf<Store<number>>().toBeObject();
    });
  });

  it('has spreadArrayStore()', () => {
    expect(spreadArrayStore).toBeDefined();
  });

  it('has spreadArrayStoreSignal()', () => {
    expect(spreadArrayStoreSignal).toBeDefined();
  });

  it('has pushToArrayStore()', () => {
    expect(pushToArrayStore).toBeDefined();
  });
});
