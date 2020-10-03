import { RootStore } from '../public-api';

class State {
  a: number;
  b: string;
  obj: { c: Date };
  ary: Array<boolean>;
}

const store = new RootStore<State>(new State());

// $ExpectType ChildStore<number>
store('a');
// $ExpectType ChildStore<{ c: Date; }>
store('obj');
// $ExpectType ChildStore<Date>
store('obj')('c');
// $ExpectType ChildStore<boolean[]>
store('ary');
// $ExpectType ChildStore<boolean>
store('ary')(1);
