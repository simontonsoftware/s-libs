import { sampleSize } from '../../lib/collection';

declare const array: number[];
declare const arrayOrNull: number[] | null;
declare const arrayOrUndefined: number[] | undefined;
declare const object: { a: number; b: string };
declare const objectOrNull: { a: number; b: string } | null;
declare const objectOrUndefined: { a: number; b: string } | undefined;

// $ExpectType number[]
sampleSize(array, 3);
// $ExpectType (string | number)[]
sampleSize(object, 3);
// $ExpectType number[]
sampleSize(array);
// $ExpectType (string | number)[]
sampleSize(object);
// $ExpectType number[]
sampleSize(arrayOrNull, 3);
// $ExpectType number[]
sampleSize(arrayOrUndefined, 3);
// $ExpectType (string | number)[]
sampleSize(objectOrNull, 3);
// $ExpectType (string | number)[]
sampleSize(objectOrUndefined, 3);
