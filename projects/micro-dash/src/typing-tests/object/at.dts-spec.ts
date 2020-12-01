import { at } from '../../lib/object';

type A = string[];
declare const a: A;
declare const aOrU: A | undefined;
declare const aOrN: A | null;

interface O {
  a: string;
  b: number;
  c: Date;
}
declare const o: O;
declare const numberArray: number[];
declare const abcArray: Array<'a' | 'b' | 'c'>;

//
// unwrapped keys
//

// $ExpectType []
at(a);
// $ExpectType [string, string]
at(a, 1, 2);
// $ExpectType string[]
at(a, ...numberArray);

// $ExpectType []
at(aOrU);
// $ExpectType [string, string] | [undefined, undefined]
at(aOrU, 1, 2);
// $ExpectType string[] | undefined[]
at(aOrU, ...numberArray);

// $ExpectType []
at(aOrN);
// $ExpectType [string, string] | [undefined, undefined]
at(aOrN, 1, 2);
// $ExpectType string[] | undefined[]
at(aOrN, ...numberArray);

// $ExpectType []
at(o);
// $ExpectType [string, number]
at(o, 'a', 'b');
// $ExpectType (string | number | Date)[]
at(o, ...abcArray);

//
// Wrapped keys
//

// $ExpectType [string]
at(a, [1]);
// $ExpectType [string, number]
at(o, ['a', 'b'] as ['a', 'b']);
// $ExpectType [string, string, string]
at(a, [1, 2, 1]);
// $ExpectType [string, string, string, string]
at(a, [1, 2, 1, 4]);
// $ExpectType [string, number, Date, string, ...(string | number | Date)[]]
at(o, ['a', 'b', 'c', 'a', 'b']);
// $ExpectType [string, number, Date, string, ...(string | number | Date)[]]
at(o, [numberArray]);

// interface D {
//   a: string;
//   b: {
//     c: number;
//     d: {
//       e: {
//         f: {
//           g: Date;
//           h: number;
//         };
//         i: number;
//       };
//     };
//   };
//   j: number;
// }
// const d = {} as D;
