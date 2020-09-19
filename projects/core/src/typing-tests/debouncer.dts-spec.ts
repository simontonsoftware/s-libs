import { Debouncer } from '../public-api';

const debouncer = new Debouncer();

// $ExpectError
debouncer.run((a: string) => {});
// $ExpectError
debouncer.run((a: string) => {}, 12);
// $ExpectError
debouncer.run((a: string) => {}, 12, 34);
// $ExpectError
debouncer.run((a: string) => {}, 12, 'hi', 23);
