import {
  PersistentStore,
  RootStore,
  Store,
  spreadArrayStore,
  pushToArrayStore,
} from '@s-libs/signal-store';
import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';

describe('signal-store', () => {
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

  it('has pushToArrayStore()', () => {
    expect(pushToArrayStore).toBeDefined();
  });
});
