import { pushToStoreArray, Store } from '../public-api';

const store = null as unknown as Store<Array<Date>>;

// $ExpectType Store<Date>
pushToStoreArray(store, new Date());
