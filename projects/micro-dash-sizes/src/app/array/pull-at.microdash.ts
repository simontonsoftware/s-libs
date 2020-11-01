import { pullAt } from '@s-libs/micro-dash';

console.log(
  pullAt([1, 2, 3], 1),
  pullAt([1, 2, 3], [1]),
  pullAt([1, 2, 3], [1, 2]),
);
