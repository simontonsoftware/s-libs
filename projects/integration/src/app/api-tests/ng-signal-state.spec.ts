import {
  PersistenceCodec,
  PersistentStore,
  pushToStoreArray,
  RootStore,
  spreadArrayStore$,
  spreadObjectStore$,
  Store,
  UndoManager,
} from '@s-libs/ng-signal-state';
import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';

describe('ng-signal-state', () => {
  it('has PersistenceCodec', () => {
    staticTest(() => {
      expectTypeOf<PersistenceCodec<number, string>>();
    });
  });

  it('has PersistentStore', () => {
    expect(PersistentStore).toBeDefined();
  });

  it('has RootStore', () => {
    expect(RootStore).toBeDefined();
  });

  it('has Store', () => {
    expect(Store).toBeDefined();
  });

  it('has UndoManager', () => {
    expect(UndoManager).toBeDefined();
  });

  it('has pushToStoreArray', () => {
    expect(pushToStoreArray).toBeDefined();
  });

  it('has spreadArrayStore$', () => {
    expect(spreadArrayStore$).toBeDefined();
  });

  it('has spreadObjectStore$', () => {
    expect(spreadObjectStore$).toBeDefined();
  });
});
