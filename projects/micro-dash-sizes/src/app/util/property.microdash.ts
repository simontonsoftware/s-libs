import { property } from '@s-libs/micro-dash';

// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -- the linter is not good at `property()`
console.log(property(['a', 'b'])({ a: 1 }));
