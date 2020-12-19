import { AsyncMethodController } from '../lib/spies';

export type Evaluate<T> = T extends infer I ? { [K in keyof I]: T[K] } : never;

const writeController = new AsyncMethodController(
  navigator.clipboard,
  'writeText',
);
const readController = new AsyncMethodController(
  navigator.clipboard,
  'readText',
);

// $ExpectType [data: string] | {}
type writeExpectOneMatchType = Evaluate<
  Parameters<typeof writeController.expectOne>[0]
>;
writeController.expectOne(
  (
    // $ExpectType CallInfo<(data: string) => Promise<void>>
    callInfo,
  ) => true,
);
// $ExpectType [] | {}
type readExpectOneMatchType = Evaluate<
  Parameters<typeof readController.expectOne>[0]
>;
readController.expectOne(
  (
    // $ExpectType CallInfo<() => Promise<string>>
    callInfo,
  ) => true,
);
