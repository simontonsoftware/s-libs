import { spreadArrayStore$, Store } from '../public-api';

declare const array: Store<Array<number>>;
declare const arrayOrNull: Store<Array<number> | null>;
declare const arrayOrUndefined: Store<Array<number> | undefined>;
declare const arrayOrNil: Store<Array<number> | null | undefined>;

// $ExpectType Observable<Store<number>[]>
spreadArrayStore$(array);
// $ExpectType Observable<Store<number>[]>
spreadArrayStore$(arrayOrNull);
// $ExpectType Observable<Store<number>[]>
spreadArrayStore$(arrayOrUndefined);
// $ExpectType Observable<Store<number>[]>
spreadArrayStore$(arrayOrNil);
