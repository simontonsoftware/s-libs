import { omitBy } from '@s-libs/micro-dash';

omitBy({ a: 1 }, () => true);
omitBy({ a: 1 }, () => false);
