import { marbleTest } from '../lib/marble-test';

// $ExpectType () => void
marbleTest(() => {});

// $ExpectType () => Promise<number>
marbleTest(async () => 1);
