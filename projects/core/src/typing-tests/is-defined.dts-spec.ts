import { assert, isDefined } from '../public-api';

const alwaysDefined = 'a';
const sometimesDefined = 'a' as string | undefined;
const neverDefined = undefined;

// $ExpectType boolean
isDefined(alwaysDefined);
// $ExpectType boolean
isDefined(sometimesDefined);
// $ExpectType boolean
isDefined(neverDefined);

assert(isDefined(alwaysDefined));
assert(isDefined(sometimesDefined));
assert(isDefined(neverDefined));

// $ExpectType "a"
const e1 = alwaysDefined;
// $ExpectType string
const e2 = sometimesDefined;
// $ExpectType never
const e3 = neverDefined;
