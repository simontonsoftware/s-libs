import { omit, pick } from '@s-libs/micro-dash';
import { staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { ReadonlyStore, Store } from './store';

describe('Store', () => {
  describe('()', () => {
    it('slices to store or readonly store objects depending on nullability', () => {
      staticTest(() => {
        const store: Store<{
          norm: string;
          opt?: string;
          null: string | null;
          any?: string | null;
        }> = null as any;
        expectTypeOf(store('norm')('length')).toEqualTypeOf<Store<number>>();
        expectTypeOf(store('opt')('length')).toEqualTypeOf<
          ReadonlyStore<number | undefined>
        >();
        expectTypeOf(store('null')('length')).toEqualTypeOf<
          ReadonlyStore<number | undefined>
        >();
        expectTypeOf(store('any')('length')).toEqualTypeOf<
          ReadonlyStore<number | undefined>
        >();
      });
    });
  });

  describe('.state', () => {
    it('is read-write', () => {
      staticTest(() => {
        const store: Store<number> = null as any;
        store.state = 1;
      });
    });
  });

  describe('.nonNull', () => {
    it('removes nil values from the state type', () => {
      staticTest(() => {
        const store: Store<{
          norm: string;
          opt?: string;
          null: string | null;
          any?: string | null;
        }> = null as any;
        expectTypeOf(store('norm').nonNull).toEqualTypeOf<Store<string>>();
        expectTypeOf(store('opt').nonNull).toEqualTypeOf<Store<string>>();
        expectTypeOf(store('null').nonNull).toEqualTypeOf<Store<string>>();
        expectTypeOf(store('any').nonNull).toEqualTypeOf<Store<string>>();
      });
    });
  });

  describe('.assign()', () => {
    it('is only available for non-nil objects', () => {
      staticTest(() => {
        const store: Store<{
          norm: { a: string };
          opt?: { a: string };
          null: { a: string } | null;
          any?: { a: string } | null;
          ary: string[];
          num: number;
        }> = null as any;
        store('norm').assign({});
        // @ts-expect-error -- can't assign to undefined
        store('opt').assign({});
        // @ts-expect-error -- can't assign to null
        store('null').assign({});
        // @ts-expect-error -- can't assign to null+undefined
        store('any').assign({});
        // @ts-expect-error -- can't assign arrays
        store('ary').assign({});
        // @ts-expect-error -- can't assign numbers
        store('num').assign({});
      });
    });
  });

  describe('.update()', () => {
    it('picks up arg types from the function', () => {
      staticTest(() => {
        const store: Store<{ a: number; b?: string }> = null as any;
        store('a').update(Math.pow, 2);
        store.update(pick, 'a');
        store.update(omit, 'b');
      });
    });
  });

  describe('.mutate()', () => {
    it('picks up arg types from the function', () => {
      staticTest(() => {
        const store: Store<{ a: number; b?: string }> = null as any;
        store.mutate(pick, 'a');
        store.mutate(omit, 'b');
      });
    });
  });
});

describe('ReadonlyStore', () => {
  describe('()', () => {
    it('always slices to readonly store objects', () => {
      staticTest(() => {
        const store: ReadonlyStore<{ norm: string; any?: string | null }> =
          null as any;
        expectTypeOf(store('norm')('length')).toEqualTypeOf<
          ReadonlyStore<number>
        >();
        expectTypeOf(store('any')('length')).toEqualTypeOf<
          ReadonlyStore<number | undefined>
        >();
      });
    });
  });

  describe('.state', () => {
    it('is readonly', () => {
      staticTest(() => {
        const store: ReadonlyStore<number> = null as any;
        // @ts-expect-error -- is readonly
        store.state = 1;
      });
    });
  });

  describe('.nonNull', () => {
    it('removes nil values and converts to a writeable store', () => {
      staticTest(() => {
        const store: ReadonlyStore<{
          norm: string;
          opt?: string;
          null: string | null;
          any?: string | null;
        }> = null as any;
        expectTypeOf(store('norm').nonNull).toEqualTypeOf<Store<string>>();
        expectTypeOf(store('opt').nonNull).toEqualTypeOf<Store<string>>();
        expectTypeOf(store('null').nonNull).toEqualTypeOf<Store<string>>();
        expectTypeOf(store('any').nonNull).toEqualTypeOf<Store<string>>();
      });
    });
  });
});
