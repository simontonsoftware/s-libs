import { shuffle } from '../../lib/collection';

declare const array: number[];
declare const arrayOrNull: number[] | null;
declare const arrayOrUndefined: number[] | undefined;
declare const object: { a: number; b: string };
declare const objectOrNull: { a: number; b: string } | null;
declare const objectOrUndefined: { a: number; b: string } | undefined;

// $ExpectType number[]
shuffle(array);
// $ExpectType (string | number)[]
shuffle(object);
// $ExpectType number[]
shuffle(arrayOrNull);
// $ExpectType number[]
shuffle(arrayOrUndefined);
// $ExpectType (string | number)[]
shuffle(objectOrNull);
// $ExpectType (string | number)[]
shuffle(objectOrUndefined);
