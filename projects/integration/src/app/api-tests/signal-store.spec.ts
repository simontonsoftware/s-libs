import { staticTest } from '@s-libs/ng-dev';
import {
  DetachedStore,
  PersistentStore,
  pushToArrayStore,
  RootStore,
  spreadArrayStore,
  spreadArrayStoreNew,
  spreadArrayStoreSignal,
  Store,
  UndoManagerSuperclass,
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

  it('has UndoManagerSuperclass', () => {
    expect(UndoManagerSuperclass).toBeDefined();
  });

  it('has Store', () => {
    staticTest(() => {
      expectTypeOf<Store<number>>().toBeObject();
    });
  });

  it('has spreadArrayStore()', () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    expect(spreadArrayStore).toBeDefined();
  });

  it('has spreadArrayStoreNew()', () => {
    expect(spreadArrayStoreNew).toBeDefined();
  });

  it('has spreadArrayStoreSignal()', () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    expect(spreadArrayStoreSignal).toBeDefined();
  });

  it('has pushToArrayStore()', () => {
    expect(pushToArrayStore).toBeDefined();
  });
});
