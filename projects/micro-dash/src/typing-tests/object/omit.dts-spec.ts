import { omit } from '../../lib/object';

declare const str: string;
declare const num: number;

declare const obj: {
  a: number;
  b: Date;
};
// $ExpectType { a: number; }
omit(obj, 'b');

declare const indexed: {
  [k: string]: number;
  [k: number]: number;
};
// $ExpectType { [x: string]: number; [x: number]: number; }
omit(indexed, 'hi');
// $ExpectType { [x: string]: number; [x: number]: number; }
omit(indexed, 5);
// $ExpectType { [x: string]: number; [x: number]: number; }
omit(indexed, 'hi', 5);
// $ExpectType { [x: string]: number; [x: number]: number; }
omit(indexed, str);

declare const record: Record<string, number>;
// $ExpectType { [x: string]: number; }
omit(record, str);

declare const composite: {
  [k: number]: Date;
  a: 'eh';
  b: 'bee';
};
// $ExpectType { [x: number]: Date; b: "bee"; }
omit(composite, 'a');
// $ExpectType { [x: number]: Date; }
omit(composite, 'a', 'b');
// $ExpectType { [x: number]: Date; a: "eh"; b: "bee"; }
omit(composite, 1);
// $ExpectType { [x: number]: Date; a: "eh"; b: "bee"; }
omit(composite, num);
// $ExpectType { [x: number]: Date; b: "bee"; }
omit(composite, num, 'a');
