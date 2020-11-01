import { pickBy } from '@s-libs/micro-dash';

pickBy({ a: 1 }, () => true);
pickBy({ a: 1 }, () => false);
