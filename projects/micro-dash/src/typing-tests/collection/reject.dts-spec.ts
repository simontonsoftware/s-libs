import { reject } from 'collection';
import { isDate, isMap, isNumber, isString } from 'lodash-es';
import {
  isA,
  isDateOrString,
  isMapOrString,
  isNumberOrString,
  isStringOr2,
  keyIsA,
  keyIsAorC,
  keyIsAorNumber,
  keyIsC,
  keyIsNumber,
  keyIsString,
  keyIsString2,
  keyIsString3,
} from '../../test-helpers/test-utils';

//
// Array
//

type A = Array<string | number>;
const a = [1, 'b'] as A;
const aOrU = a as A | undefined;
const aOrN = a as A | null;

// $ExpectType (string | number)[]
reject(a, () => true);
// $ExpectType (string | number)[]
reject(aOrU, () => true);
// $ExpectType (string | number)[]
reject(aOrN, () => true);

// Narrowing

// $ExpectType number[]
reject(a, isString);
// $ExpectType number[]
reject(aOrU, isString);
// $ExpectType number[]
reject(aOrN, isString);

// $ExpectType number[]
reject(a, isDateOrString);
// $ExpectType number[]
reject(aOrU, isDateOrString);
// $ExpectType number[]
reject(aOrN, isDateOrString);

// $ExpectType (string | number)[]
reject(a, isA);
// $ExpectType (string | number)[]
reject(aOrU, isA);
// $ExpectType (string | number)[]
reject(aOrN, isA);

type AB = Array<'a' | 'b'>;
const ab = ['a'] as AB;
const abOrU = ['a'] as AB | undefined;
const abOrN = ['a'] as AB | null;
// $ExpectType "b"[]
reject(ab, isA);
// $ExpectType "b"[]
reject(abOrU, isA);
// $ExpectType "b"[]
reject(abOrN, isA);

type AN = Array<'a' | number>;
const an = ['a'] as AN;
const anOrU = ['a'] as AN | undefined;
const anOrN = ['a'] as AN | null;
// $ExpectType number[]
reject(an, isStringOr2);
// $ExpectType number[]
reject(anOrU, isStringOr2);
// $ExpectType number[]
reject(anOrN, isStringOr2);

//
// Object
//

interface O {
  a: number;
  2: string;
  c: Date | Document;
}
const o = { a: 1, 2: 'b', c: document } as O;
const oOrU = o as O | undefined;
const oOrN = o as O | null;

// $ExpectType (string | number | Date | Document)[]
reject(o, () => true);
// $ExpectType (string | number | Date | Document)[]
reject(oOrU, () => true);
// $ExpectType (string | number | Date | Document)[]
reject(oOrN, () => true);

// Value narrowing

// $ExpectType (number | Date | Document)[]
reject(o, isString);
// $ExpectType (number | Date | Document)[]
reject(oOrU, isString);
// $ExpectType (number | Date | Document)[]
reject(oOrN, isString);

// $ExpectType (string | number | Document)[]
reject(o, isDate);
// $ExpectType (string | number | Document)[]
reject(oOrU, isDate);
// $ExpectType (string | number | Document)[]
reject(oOrN, isDate);

// $ExpectType (Date | Document)[]
reject(o, isNumberOrString);
// $ExpectType (Date | Document)[]
reject(oOrU, isNumberOrString);
// $ExpectType (Date | Document)[]
reject(oOrN, isNumberOrString);

// $ExpectType (number | Document)[]
reject(o, isDateOrString);
// $ExpectType (number | Document)[]
reject(oOrU, isDateOrString);
// $ExpectType (number | Document)[]
reject(oOrN, isDateOrString);

// $ExpectType (string | number | Date | Document)[]
reject(o, isMap);
// $ExpectType (string | number | Date | Document)[]
reject(oOrU, isMap);
// $ExpectType (string | number | Date | Document)[]
reject(oOrN, isMap);

// $ExpectType (number | Date | Document)[]
reject(o, isMapOrString);
// $ExpectType (number | Date | Document)[]
reject(oOrU, isMapOrString);
// $ExpectType (number | Date | Document)[]
reject(oOrN, isMapOrString);

interface S2 {
  a: 'a' | number;
}
const s2 = { a: 2 } as S2;
const s2OrU = { a: 2 } as S2 | undefined;
const s2OrN = { a: 2 } as S2 | null;
// $ExpectType number[]
reject(s2, isA);
// $ExpectType number[]
reject(s2OrU, isA);
// $ExpectType number[]
reject(s2OrN, isA);
// $ExpectType number[]
reject(s2, isStringOr2);
// $ExpectType number[]
reject(s2OrU, isStringOr2);
// $ExpectType number[]
reject(s2OrN, isStringOr2);

// Key narrowing

interface S {
  a: number;
  b: string;
  c: Date | Document;
}
const s = { a: 1, b: '2', c: document } as S;
const sOrU = s as S | undefined;
const sOrN = s as S | null;

// $ExpectType never[]
reject(s, keyIsString);
// $ExpectType never[]
reject(sOrU, keyIsString);
// $ExpectType never[]
reject(sOrN, keyIsString);
// $ExpectType never[]
reject(o, keyIsString);
// $ExpectType never[]
reject(oOrU, keyIsString);
// $ExpectType never[]
reject(oOrN, keyIsString);

// $ExpectType (string | number | Date | Document)[]
reject(s, keyIsNumber);
// $ExpectType (string | number | Date | Document)[]
reject(sOrU, keyIsNumber);
// $ExpectType (string | number | Date | Document)[]
reject(sOrN, keyIsNumber);
// $ExpectType (string | number | Date | Document)[]
reject(o, keyIsNumber);
// $ExpectType (string | number | Date | Document)[]
reject(oOrU, keyIsNumber);
// $ExpectType (string | number | Date | Document)[]
reject(oOrN, keyIsNumber);

// $ExpectType (string | Date | Document)[]
reject(s, keyIsA);
// $ExpectType (string | Date | Document)[]
reject(sOrU, keyIsA);
// $ExpectType (string | Date | Document)[]
reject(sOrN, keyIsA);
// $ExpectType (string | Date | Document)[]
reject(o, keyIsA);
// $ExpectType (string | Date | Document)[]
reject(oOrU, keyIsA);
// $ExpectType (string | Date | Document)[]
reject(oOrN, keyIsA);

// $ExpectType (string | number | Date | Document)[]
reject(s, keyIsString2);
// $ExpectType (string | number | Date | Document)[]
reject(sOrU, keyIsString2);
// $ExpectType (string | number | Date | Document)[]
reject(sOrN, keyIsString2);
// $ExpectType (string | number | Date | Document)[]
reject(o, keyIsString2);
// $ExpectType (string | number | Date | Document)[]
reject(oOrU, keyIsString2);
// $ExpectType (string | number | Date | Document)[]
reject(oOrN, keyIsString2);

// $ExpectType (string | number | Date | Document)[]
reject(s, keyIsString3);
// $ExpectType (string | number | Date | Document)[]
reject(sOrU, keyIsString3);
// $ExpectType (string | number | Date | Document)[]
reject(sOrN, keyIsString3);
// $ExpectType (string | number | Date | Document)[]
reject(o, keyIsString3);
// $ExpectType (string | number | Date | Document)[]
reject(oOrU, keyIsString3);
// $ExpectType (string | number | Date | Document)[]
reject(oOrN, keyIsString3);

// $ExpectType (string | number)[]
reject(s, keyIsC);
// $ExpectType (string | number)[]
reject(sOrU, keyIsC);
// $ExpectType (string | number)[]
reject(sOrN, keyIsC);
// $ExpectType (string | number)[]
reject(o, keyIsC);
// $ExpectType (string | number)[]
reject(oOrU, keyIsC);
// $ExpectType (string | number)[]
reject(oOrN, keyIsC);

// $ExpectType string[]
reject(s, keyIsAorC);
// $ExpectType string[]
reject(sOrU, keyIsAorC);
// $ExpectType string[]
reject(sOrN, keyIsAorC);
// $ExpectType string[]
reject(o, keyIsAorC);
// $ExpectType string[]
reject(oOrU, keyIsAorC);
// $ExpectType string[]
reject(oOrN, keyIsAorC);

// $ExpectType (string | Date | Document)[]
reject(s, keyIsAorNumber);
// $ExpectType (string | Date | Document)[]
reject(sOrU, keyIsAorNumber);
// $ExpectType (string | Date | Document)[]
reject(sOrN, keyIsAorNumber);
// $ExpectType (string | Date | Document)[]
reject(o, keyIsAorNumber);
// $ExpectType (string | Date | Document)[]
reject(oOrU, keyIsAorNumber);
// $ExpectType (string | Date | Document)[]
reject(oOrN, keyIsAorNumber);

const so = {} as { [key: string]: number | string };
// $ExpectType number[]
reject(so, isString);
// $ExpectType string[]
reject(so, isNumber);
// $ExpectType (string | number)[]
reject(so, isDate);
// $ExpectType number[]
reject(so, isDateOrString);
// $ExpectType never[]
reject(so, keyIsString);
// $ExpectType (string | number)[]
reject(so, keyIsA);
// $ExpectType (string | number)[]
reject(so, keyIsNumber);
