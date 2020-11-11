import { RootStore } from '../public-api';

class State {
  a: number;
  b: string;
  obj: { c: Date };
  ary: Array<boolean>;
}

const store = new RootStore<State>(new State());

// $ExpectType Store<number>
store('a');
// $ExpectType Store<{ c: Date; }>
store('obj');
// $ExpectType Store<Date>
store('obj')('c');
// $ExpectType Store<boolean[]>
store('ary');
// $ExpectType Store<boolean>
store('ary')(1);

// $ExpectType RootStore<object>
store.getRootStore();
// $ExpectType RootStore<object>
store('obj')('c').getRootStore();
