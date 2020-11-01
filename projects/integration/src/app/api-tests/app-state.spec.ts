import {
  pushToStoreArray,
  RootStore,
  spreadArrayStore$,
  spreadObjectStore$,
  Store,
  UndoManager,
} from '@s-libs/app-state';

describe('app-state', () => {
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
