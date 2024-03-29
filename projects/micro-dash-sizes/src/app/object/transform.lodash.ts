import transform from 'lodash-es/transform';

console.log(
  transform(
    { a: false, b: true },
    (accum: Record<string, boolean>, value, key) => (accum[key] = value),
  ),
);
