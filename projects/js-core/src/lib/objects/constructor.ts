/**
 * Taken from the {@link https://www.typescriptlang.org/docs/handbook/mixins.html#constrained-mixins | typescript docs for mixins}.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- this comes directly from TS docs (at the link above)
export type Constructor<T = {}> = new (...args: any[]) => T;
