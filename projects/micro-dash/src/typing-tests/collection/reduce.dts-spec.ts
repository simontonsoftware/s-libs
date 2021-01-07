import { reduce } from '../../lib/collection';
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
reduce(a, identity);
// $ExpectType string | number | undefined
reduce(aOrNull, identity);
// $ExpectType string | number | undefined
reduce(aOrUndefined, identity);
// $ExpectType string | number | undefined
reduce(aOrNullOrUndefined, identity);
// $ExpectType number
reduce(a, identity, 4);
// $ExpectType number
reduce(aOrNull, identity, 4);
// $ExpectType number
reduce(aOrUndefined, identity, 4);
// $ExpectType number
reduce(aOrNullOrUndefined, identity, 4);

// $ExpectType string | number
reduce(o, identity);
// $ExpectType string | number | undefined
reduce(oOrNull, identity);
// $ExpectType string | number | undefined
reduce(oOrUndefined, identity);
// $ExpectType string | number | undefined
reduce(oOrNullOrUndefined, identity);
// $ExpectType number
reduce(o, identity, 4);
// $ExpectType number
reduce(oOrNull, identity, 4);
// $ExpectType number
reduce(oOrUndefined, identity, 4);
// $ExpectType number
reduce(oOrNullOrUndefined, identity, 4);

reduce(
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
reduce(
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
reduce(
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
reduce(
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

reduce(
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
reduce(
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
reduce(
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
reduce(
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
