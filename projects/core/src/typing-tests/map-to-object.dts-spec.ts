import { mapToObject } from '../public-api';

type A = number[];
type AorU = A | undefined;
type AorN = A | null;

const a = [] as A;
const aOrU = a as AorU;
const aOrN = a as AorN;

// $ExpectType { a?: number | undefined; }
mapToObject(a, () => ['a', 1]);
// $ExpectType { a?: number | undefined; }
mapToObject(aOrN, () => ['a', 1]);
// $ExpectType { a?: number | undefined; }
mapToObject(aOrU, () => ['a', 1]);

interface O {
  a: string;
  b: number;
}
type OorU = O | undefined;
type OorN = O | null;

const o = {} as O;
const oOrU = o as OorU;
const oOrN = o as OorN;

// $ExpectType { a?: number | undefined; }
mapToObject(o, () => ['a', 1]);
// $ExpectType { a?: number | undefined; }
mapToObject(oOrU, () => ['a', 1]);
// $ExpectType { a?: number | undefined; }
mapToObject(oOrN, () => ['a', 1]);
