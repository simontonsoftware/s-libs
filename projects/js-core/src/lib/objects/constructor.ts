/**
 * Taken from the [typescript docs for mixins](https://www.typescriptlang.org/docs/handbook/mixins.html).
 */
export type Constructor<T = {}> = new (...args: any[]) => T;
