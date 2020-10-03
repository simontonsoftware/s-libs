import { pushToStoreArray, ChildStore } from '../public-api';

const store = (null as unknown) as ChildStore<Array<Date>>;

// $ExpectType ChildStore<Date>
pushToStoreArray(store, new Date());
