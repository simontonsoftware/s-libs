import { forEach } from '../../lib/collection';

interface Obj {
  a: 1;
  b: string;
}

declare const array: number[];
declare const arrayOrN: number[] | null;
declare const arrayOrU: number[] | undefined;

// $ExpectType number[]
forEach(
  array,
  (
    // $ExpectType number
    val,
    // $ExpectType number
    index,
  ) => {},
);
// $ExpectType number[] | null
forEach(
  arrayOrN,
  (
    // $ExpectType number
    val,
    // $ExpectType number
    index,
  ) => {},
);
// $ExpectType number[] | undefined
forEach(
  arrayOrU,
  (
    // $ExpectType number
    val,
    // $ExpectType number
    index,
  ) => {},
);

declare const tuple: [string, Date];
declare const tupleOrN: [string, Date] | null;
declare const tupleOrU: [string, Date] | undefined;

// $ExpectType [string, Date]
forEach(
  tuple,
  (
    // $ExpectType string | Date
    val,
    // $ExpectType number
    index,
  ) => {},
);
// $ExpectType [string, Date] | null
forEach(
  tupleOrN,
  (
    // $ExpectType string | Date
    val,
    // $ExpectType number
    index,
  ) => {},
);
// $ExpectType [string, Date] | undefined
forEach(
  tupleOrU,
  (
    // $ExpectType string | Date
    val,
    // $ExpectType number
    index,
  ) => {},
);

declare const obj: Obj;
declare const objOrN: Obj | null;
declare const objOrU: Obj | undefined;

// $ExpectType Obj
forEach(
  obj,
  (
    // $ExpectType string | 1
    val,
    // $ExpectType "a" | "b"
    key,
  ) => {},
);
// $ExpectType Obj | null
forEach(
  objOrN,
  (
    // $ExpectType string | 1
    val,
    // $ExpectType "a" | "b"
    key,
  ) => {},
);
// $ExpectType Obj | undefined
forEach(
  objOrU,
  (
    // $ExpectType string | 1
    val,
    // $ExpectType "a" | "b"
    key,
  ) => {},
);
