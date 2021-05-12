import { keyBy } from '../../lib/collection';

// https://github.com/simontonsoftware/micro-dash/issues/35
import { ObjectWith } from '../../lib/interfaces';

interface Named {
  name: string;
}
const namedArray: Named[] = [{ name: 'Jimmy' }];
const namedObject: ObjectWith<Named> = { a: { name: 'Jimmy' } };
// $ExpectType { [x: string]: Named; }
keyBy(namedArray, (e) => e.name);
// $ExpectType { [x: string]: Named; }
keyBy(namedObject, (e) => e.name);
