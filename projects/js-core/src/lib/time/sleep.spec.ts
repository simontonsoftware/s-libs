import { fakeAsync, tick } from '@angular/core/testing';
import { sleep } from './sleep';
import { TimeUnit } from './time-utils';

/* eslint-disable @typescript-eslint/no-floating-promises */

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

  it('accepts units for the delay', fakeAsync(() => {
    let resolved = false;
    sleep(10, TimeUnit.Seconds).then(() => {
      resolved = true;
    });

    tick(9_999);
    expect(resolved).toBe(false);
    tick(1);
    expect(resolved).toBe(true);
  }));
});
