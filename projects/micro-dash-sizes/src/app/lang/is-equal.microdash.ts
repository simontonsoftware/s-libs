import { isEqual } from '@s-libs/micro-dash';

isEqual('a', []);
isEqual({}, {});
isEqual([], 'a');
