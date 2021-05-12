import { get } from '../../lib/object';

class Wrap1 {
  value?: number;
}

class Wrap2 {
  wrap1 = new Wrap1();
  value = 'bye';
}

// $ExpectType number | "hi"
get(new Wrap2(), ['wrap1', 'value'], 'hi');
// $ExpectType number | "hi"
get(new Wrap1(), 'value', 'hi');
