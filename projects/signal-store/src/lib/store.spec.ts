describe('Store', () => {
  describe('()', () => {
    it('slices to store or readonly store objects depending on nullability');
  });

  describe('.state', () => {
    it('is read-write');
  });

  describe('.update()', () => {
    it('picks up arg types from the function');
  });

  describe('.mutate()', () => {
    it('picks up arg types from the function');
  });

  describe('.assign()', () => {
    it('is only available for non-nullable stores');
  });
});

describe('ReadonlyStore', () => {
  describe('()', () => {
    it('always slices to readonly store objects');
  });

  describe('.state', () => {
    it('is readonly');
  });

  describe('.nonNull', () => {
    it('allows all the slicing and mutating again');
  });
});

// describe('Store', () => {
//   describe('()', () => {
//     it('slices to store objects', () => {
//       staticTest(() => {
//         const store: Store<{ date: Date }> = null as any;
//         expectTypeOf(store('date')).toEqualTypeOf<Store<Date>>();
//       });
//     });
//
//     it('potentially nil values slice to a readonly store', () => {
//       staticTest(() => {
//         const store: Store<{ ary?: boolean[] }> = null as any;
//         expectTypeOf(store('ary')('length')).toEqualTypeOf<
//           ReadonlyStore<number | undefined>
//         >();
//       });
//     });
//
//     it('slices to a deletable store for optional fields', () => {
//       staticTest(() => {
//         const store: Store<{ name?: string }> = null as any;
//         expectTypeOf(store('name')).toEqualTypeOf<
//           DeletableStore<string | undefined>
//         >();
//       });
//     });
//   });
// });
//
// describe('DeletableStore', () => {
//   describe('()', () => {
//     it('can only slice to readonly stores', () => {
//       staticTest(() => {
//         const store: DeletableStore<{ s: string; opt?: number }> = null as any;
//         const ss = store('s');
//         expectTypeOf(ss).toEqualTypeOf<ReadonlyStore<string | undefined>>();
//       });
//     });
//   });
// });
//
// describe('ReadonlyStore', () => {
//   describe('()', () => {
//     it('can only slice to readonly stores', () => {
//       fail('TODO');
//       staticTest(() => {});
//     });
//
//     it('autocompletes keys', () => {
//       // even for things that could be undefined
//       fail('TODO');
//       staticTest(() => {});
//     });
//   });
// });
