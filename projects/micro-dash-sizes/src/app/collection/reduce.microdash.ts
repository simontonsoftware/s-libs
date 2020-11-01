import { reduce } from '@s-libs/micro-dash';

reduce([], () => {});
reduce({ a: 1 }, (key) => key);
