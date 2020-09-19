import { Deferred } from '../public-api';

// No actual type expectations here, just that there are no compile errors
new Deferred<void>().resolve();
new Deferred<string>().resolve('hi');
new Deferred<object>().reject();
new Deferred<number>().reject('bye');
