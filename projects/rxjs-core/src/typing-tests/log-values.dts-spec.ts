import { of } from 'rxjs';
import { logValues } from '../lib/operators';

// $ExpectType Observable<number>
of(1).pipe(logValues());

// $ExpectType Observable<string>
of('hi').pipe(logValues('prefix'));

// $ExpectType Observable<Date>
of(new Date()).pipe(logValues('prefix', 'warn'));
