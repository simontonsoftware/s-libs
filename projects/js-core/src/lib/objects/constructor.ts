/**
 * Taken from the [typescript docs for mixins](https://www.typescriptlang.org/docs/handbook/mixins.html).
 */
// eslint-disable-next-line @typescript-eslint/ban-types -- this comes directly from TS docs (at the link above)
export type Constructor<T = {}> = new (...args: any[]) => T;
