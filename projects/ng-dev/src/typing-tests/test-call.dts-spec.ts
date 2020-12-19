import { AsyncMethodController } from '../lib/spies';

const writeController = new AsyncMethodController(
  navigator.clipboard,
  'writeText',
);
const readController = new AsyncMethodController(
  navigator.clipboard,
  'readText',
);

const writeTestCall = writeController.expectOne(['something I copied']);
const readTestCall = readController.expectOne([]);

// $ExpectType [data: string]
const writeArgs = writeTestCall.callInfo.args;
// $ExpectType []
const readArgs = readTestCall.callInfo.args;

// $ExpectType (value: void) => void
const writeFlush = writeTestCall.flush;
// $ExpectType (value: string) => void
const readFlush = readTestCall.flush;
