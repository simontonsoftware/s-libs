import { isNumber } from 'lodash-es';
import { pickBy } from '../../public-api';
import {
  keyIsA,
  keyIsDateOrString,
  keyIsNumber,
  keyIsString,
} from '../../test-helpers/test-utils';

declare const record: Record<string, number>;
// $ExpectType { [x: string]: number; }
pickBy(record, isNumber);
// $ExpectType { [x: string]: number; }
pickBy(record, keyIsString);
// $ExpectType {}
pickBy(record, keyIsNumber);
// $ExpectType { [x: string]: number; }
pickBy(record, keyIsDateOrString);
// $ExpectType { a: number; }
pickBy(record, keyIsA);
// $ExpectType { [x: string]: number; }
pickBy(record, () => true);
