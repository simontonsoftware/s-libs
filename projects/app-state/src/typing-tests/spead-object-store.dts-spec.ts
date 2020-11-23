import { spreadObjectStore$, Store } from '../public-api';

declare const object: Store<Record<string, number>>;
declare const objectOrNull: Store<Record<string, number> | null>;
declare const objectOrUndefined: Store<Record<string, number> | undefined>;
declare const objectOrNil: Store<Record<string, number> | null | undefined>;

// $ExpectType Observable<Store<number>[]>
spreadObjectStore$(object);
// $ExpectType Observable<Store<number>[]>
spreadObjectStore$(objectOrNull);
// $ExpectType Observable<Store<number>[]>
spreadObjectStore$(objectOrUndefined);
// $ExpectType Observable<Store<number>[]>
spreadObjectStore$(objectOrNil);
