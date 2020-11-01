import { identity, isString } from '@s-libs/micro-dash';
import { assert } from '../public-api';

const v = '' as string | Date;
// $ExpectType string | Date
identity(v);

assert(isString(v));
// $ExpectType string
identity(v);
