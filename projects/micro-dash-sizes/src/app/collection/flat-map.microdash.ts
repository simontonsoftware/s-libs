import { flatMap } from '@s-libs/micro-dash';

console.log(
  flatMap([1, 2, 3], (n) => [n, n]),
  flatMap({ a: 1, b: 2, c: 3 }, (n) => n),
);
