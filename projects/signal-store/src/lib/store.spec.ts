// import { expectTypeOf } from 'expect-type';
// import { Store } from './store';
//
// describe('Store', () => {
//   // it('slices to store objects', () => {
//   //   staticTest(() => {
//   //     class State {
//   //       a!: number;
//   //       b!: string;
//   //       obj!: { c: Date };
//   //       ary!: boolean[];
//   //     }
//   //
//   //     const str = new RootStore(new State());
//   //
//   //     expectTypeOf(str('a')).toEqualTypeOf<Store<number>>();
//   //     expectTypeOf(str('obj')).toEqualTypeOf<Store<{ c: Date }>>();
//   //     expectTypeOf(str('obj')('c')).toEqualTypeOf<Store<Date>>();
//   //     expectTypeOf(str('ary')).toEqualTypeOf<Store<boolean[]>>();
//   //     expectTypeOf(str('ary')(1)).toEqualTypeOf<Store<boolean>>();
//   //   });
//   // });
//
//   it('slices to a readonly store when value could be nil', () => {
//     staticTest(() => {
//       const store: Store<{ ary?: boolean[] }> = null as any;
//       const date = new Date();
//
//       const slice = date('ary');
//       expectTypeOf(slice).toEqualTypeOf<Date>();
//     });
//   });
//
//   it('slices to a deletable store for optional fields', () => {
//     fail('TODO');
//   });
//
//   it('autocompletes keys', () => {
//     // even for things that could be undefined
//     fail('TODO');
//   });
// });
