import { of } from 'rxjs';
import { delayOnMicrotaskQueue } from '../lib/operators';

// $ExpectType Observable<number>
of(1).pipe(delayOnMicrotaskQueue());
