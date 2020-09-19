import { mapAsKeys } from '../public-api';

type A = number[];
type AorU = A | undefined;
type AorN = A | null;

const a = [] as A;
const aOrU = a as AorU;
const aOrN = a as AorN;

// $ExpectType { [x: number]: string; }
mapAsKeys(a, () => 'a');
// $ExpectType {} | { [x: number]: string; }
mapAsKeys(aOrN, () => 'a');
// $ExpectType {} | { [x: number]: string; }
mapAsKeys(aOrU, () => 'a');

interface O {
  a: string;
  b: number;
}
type OorU = O | undefined;
type OorN = O | null;

const o = {} as O;
const oOrU = o as OorU;
const oOrN = o as OorN;

mapAsKeys({ a: 'foo', b: 'bar' }, (_item, key) => key.toUpperCase());

// $ExpectType { [x: string]: boolean; [x: number]: boolean; }
mapAsKeys(o, () => true);
// $ExpectType {} | { [x: string]: boolean; [x: number]: boolean; }
mapAsKeys(oOrU, () => true);
// $ExpectType {} | { [x: string]: boolean; [x: number]: boolean; }
mapAsKeys(oOrN, () => true);
