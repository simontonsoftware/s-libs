import { flatten } from '../array';
import { IfCouldBe, Nil } from '../interfaces';
import { get } from './get';

// TODO: come back to this with typescript 4.1 when we don't need to index temporary objects anymore. An experiment showed that got rid of the error "Type instantiation is excessively deep and possibly infinite."

// /** @hidden */
// type Get<T, P> = P extends any[]
//   ? number extends P['length']
//     ? unknown
//     : P['length'] extends 0
//       ? T
//       : Get<T[Extract<P, any[]>[0]], Tail<Extract<P, any[]>>>
//   : T[Extract<P, keyof T>];
//
// /** @hidden */
// type InnerAt<T, P extends any[], R extends any[] = []> =
//   P['length'] extends 0 ? R : InnerAt<T, Tail<P>, [...R, Get<T, P[0]>]>;

/** @hidden */
type Tail<A extends any[]> = A extends [any, ...infer T] ? T : never;

/** @hidden */
type Get<T, P> = {
  0: '0 in Get'; // unknown;
  1: T;
  2: Get<T[Extract<P, any[]>[0]], Tail<Extract<P, any[]>>>;
  3: T[Extract<P, keyof T>];
}[P extends any[]
  ? number extends P['length']
    ? 0
    : P['length'] extends 0
    ? 1
    : 2
  : 3];

/** @hidden */
type InnerAt<T, P extends any[], R extends any[] = []> = {
  baseCase: R;
  1: InnerAt<T, Tail<P>, [...R, Get<T, P[0]>]>;
}[P['length'] extends 0 ? 'baseCase' : 1];

/** @hidden */
type OuterAt<T, P extends any[], R extends any[] = []> = {
  outerArray: Array<T[P[number]]>;
  baseCase: R;
  array: OuterAt<T, Tail<P>, [...R, ...Array<T[P[0][number]]>]>;
  tuple: OuterAt<T, Tail<P>, [...R, ...InnerAt<T, P[0]>]>;
  key: OuterAt<T, Tail<P>, [...R, Get<T, P[0]>]>;
}[number extends P['length']
  ? 'outerArray'
  : P['length'] extends 0
  ? 'baseCase'
  : P[0] extends any[]
  ? number extends P[0]['length']
    ? 'array'
    : 'tuple'
  : 'key'];

/** @hidden */
type Fill<T extends any[], V, R extends any[] = []> = {
  0: R;
  1: Fill<Tail<T>, V, [...R, V]>;
}[T['length'] extends 0 ? 0 : 1];

/**
 * Creates an array of values corresponding to `paths` of `object`.
 *
 * Differences from lodash:
 * - does not handle a dot-separated strings within `paths`
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash:
 * - Micro-dash:
 */

// Unwrapped keys
export function at<
  I,
  T extends NonNullable<I>,
  P extends Array<keyof T | Array<keyof T> | Array<Array<PropertyKey>>>
>(
  object: I,
  ...paths: P
): OuterAt<NonNullable<T>, P> | IfCouldBe<I, Nil, Fill<P, undefined>>;

// temporary to get specs compiling while typing is in progress
export function at(object: any, ...paths: any[]): any[];

export function at(object: any, ...paths: any[]): any[] {
  return flatten(paths).map((path) => get(object, path));
}
