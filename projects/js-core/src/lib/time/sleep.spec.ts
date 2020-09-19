import { fakeAsync, tick } from '@angular/core/testing';
import { sleep } from './sleep';

describe('sleep()', () => {
  it('resolves after the given delay', fakeAsync(() => {
    let resolved = false;
    sleep(1000).then(() => {
      resolved = true;
    });

    tick(999);
    expect(resolved).toBe(false);
    tick(1);
    expect(resolved).toBe(true);
  }));
});
