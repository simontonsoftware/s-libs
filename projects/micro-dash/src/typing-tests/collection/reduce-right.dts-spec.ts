import { reduceRight } from '../../lib/collection';
import { identity } from '../../lib/util';

type Ary = Array<string | number>;
type Obj = { a: string; b: number };

declare const a: Ary;
declare const aOrNull: Ary | null;
declare const aOrUndefined: Ary | undefined;
declare const aOrNullOrUndefined: Ary | null | undefined;
declare const o: Obj;
declare const oOrNull: Obj | null;
declare const oOrUndefined: Obj | undefined;
declare const oOrNullOrUndefined: Obj | null | undefined;

// $ExpectType string | number
reduceRight(a, identity);
// $ExpectType string | number | undefined
reduceRight(aOrNull, identity);
// $ExpectType string | number | undefined
reduceRight(aOrUndefined, identity);
// $ExpectType string | number | undefined
reduceRight(aOrNullOrUndefined, identity);
// $ExpectType number
reduceRight(a, identity, 4);
// $ExpectType number
reduceRight(aOrNull, identity, 4);
// $ExpectType number
reduceRight(aOrUndefined, identity, 4);
// $ExpectType number
reduceRight(aOrNullOrUndefined, identity, 4);

// $ExpectType string | number
reduceRight(o, identity);
// $ExpectType string | number | undefined
reduceRight(oOrNull, identity);
// $ExpectType string | number | undefined
reduceRight(oOrUndefined, identity);
// $ExpectType string | number | undefined
reduceRight(oOrNullOrUndefined, identity);
// $ExpectType number
reduceRight(o, identity, 4);
// $ExpectType number
reduceRight(oOrNull, identity, 4);
// $ExpectType number
reduceRight(oOrUndefined, identity, 4);
// $ExpectType number
reduceRight(oOrNullOrUndefined, identity, 4);

reduceRight(
  a,
  (
    // $ExpectType string | number
    accumulator,
    // $ExpectType string | number
    value,
    // $ExpectType number
    index,
  ) => 1,
);
reduceRight(
  aOrNull,
  (
    // $ExpectType string | number
    accumulator,
    // $ExpectType string | number
    value,
    // $ExpectType number
    index,
  ) => 1,
);
reduceRight(
  a,
  (
    // $ExpectType Date
    accumulator,
    // $ExpectType string | number
    value,
    // $ExpectType number
    index,
  ) => accumulator,
  new Date(),
);
reduceRight(
  aOrNull,
  (
    // $ExpectType Date
    accumulator,
    // $ExpectType string | number
    value,
    // $ExpectType number
    index,
  ) => accumulator,
  new Date(),
);

reduceRight(
  o,
  (
    // $ExpectType string | number
    accumulator,
    // $ExpectType string | number
    value,
    // $ExpectType "a" | "b"
    index,
  ) => 1,
);
reduceRight(
  oOrNull,
  (
    // $ExpectType string | number
    accumulator,
    // $ExpectType string | number
    value,
    // $ExpectType "a" | "b"
    index,
  ) => 1,
);
reduceRight(
  o,
  (
    // $ExpectType Date
    accumulator,
    // $ExpectType string | number
    value,
    // $ExpectType "a" | "b"
    index,
  ) => accumulator,
  new Date(),
);
reduceRight(
  oOrNull,
  (
    // $ExpectType Date
    accumulator,
    // $ExpectType string | number
    value,
    // $ExpectType "a" | "b"
    index,
  ) => accumulator,
  new Date(),
);
