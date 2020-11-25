import { pick } from '../../lib/object';

declare const str: string;
declare const num: number;

declare const obj: {
  a: number;
  b: Date;
};
// $ExpectType { b: Date; }
pick(obj, 'b');

declare const objOrNull: typeof obj | null;
declare const objOrUndefined: typeof obj | undefined;
declare const objOrNil: typeof obj | null | undefined;
// $ExpectType {} | { b: Date; }
pick(objOrNull, 'b');
// $ExpectType {} | { b: Date; }
pick(objOrUndefined, 'b');
// $ExpectType {} | { b: Date; }
pick(objOrNil, 'b');

declare const indexed: {
  [k: string]: number;
  [k: number]: number;
};
// $ExpectType { hi: number; }
pick(indexed, 'hi');
// $ExpectType { 5: number; }
pick(indexed, 5);
// $ExpectType { hi: number; 5: number; }
pick(indexed, 'hi', 5);
// $ExpectType { [x: string]: number; }
pick(indexed, str);

declare const record: Record<string, number>;
// $ExpectType { [x: string]: number; }
pick(record, str);

declare const composite: {
  [k: number]: Date;
  a: 'eh';
  b: 'bee';
};
// $ExpectType { a: "eh"; }
pick(composite, 'a');
// $ExpectType { a: "eh"; b: "bee"; }
pick(composite, 'a', 'b');
// $ExpectType { 1: Date; }
pick(composite, 1);
// $ExpectType { [x: number]: Date; }
pick(composite, num);
// $ExpectType { [x: number]: Date; a: "eh"; }
pick(composite, num, 'a');
