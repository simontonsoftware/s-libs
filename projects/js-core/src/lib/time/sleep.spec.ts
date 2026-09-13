import { sleep } from './sleep';
import { TimeUnit } from './time-utils';

/* eslint-disable @typescript-eslint/no-floating-promises */

describe('sleep()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('resolves after the given delay', async () => {
    let resolved = false;
    sleep(1000).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(999);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);
  });

  it('accepts units for the delay', async () => {
    let resolved = false;
    sleep(10, TimeUnit.Seconds).then(() => {
      resolved = true;
    });

    await vi.advanceTimersByTimeAsync(9_999);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(resolved).toBe(true);
  });
});
