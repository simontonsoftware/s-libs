import {
  AngularContext,
  AsyncMethodController,
  expectSingleCallAndReset,
  IsPageVisibleHarness,
  TestCall,
} from '@s-libs/ng-dev';
import {
  ExtendedNavigator,
  keepWakeLock$,
  WakeLock,
  WakeLockSentinel,
} from './keep-wake-lock';

class MockSentinel implements WakeLockSentinel {
  release = jasmine.createSpy();
}

const nav = navigator as ExtendedNavigator;

describe('keepWakeLock$()', () => {
  let ctx: AngularContext;
  let isPageVisibleHarness: IsPageVisibleHarness;
  let request: AsyncMethodController<WakeLock, 'request'>;
  beforeEach(() => {
    ctx = new AngularContext();
    isPageVisibleHarness = new IsPageVisibleHarness();
    request = new AsyncMethodController(nav.wakeLock!, 'request');
  });

  function flushRequest(): MockSentinel {
    const sentinel = new MockSentinel();
    expectRequest().flush(sentinel);
    return sentinel;
  }

  function expectRequest(): TestCall<WakeLock['request']> {
    expect().nothing();
    return request.expectOne(['screen']);
  }

  it('requests a wake lock immediately', () => {
    ctx.run(() => {
      keepWakeLock$().subscribe();
      expectRequest();
    });
  });

  it('waits until the screen is visible', () => {
    ctx.run(() => {
      isPageVisibleHarness.setVisible(false);
      keepWakeLock$().subscribe();
      request.verify();
      isPageVisibleHarness.setVisible(true);
      expectRequest();
    });
  });

  it('resubscribes whenever the screen becomes visible', () => {
    ctx.run(() => {
      keepWakeLock$().subscribe();
      expectRequest();

      isPageVisibleHarness.setVisible(false);
      isPageVisibleHarness.setVisible(true);
      expectRequest();

      isPageVisibleHarness.setVisible(false);
      isPageVisibleHarness.setVisible(true);
      expectRequest();
    });
  });

  it('releases the lock when unsubscribed from', () => {
    ctx.run(() => {
      const subscription = keepWakeLock$().subscribe();
      const sentinel = flushRequest();
      expect(sentinel.release).not.toHaveBeenCalled();
      subscription.unsubscribe();
      ctx.tick();
      expectSingleCallAndReset(sentinel.release);
    });
  });

  it('handles a rejected lock request', () => {
    ctx.run(() => {
      keepWakeLock$().subscribe();
      expect(() => {
        expectRequest().error('battery is low');
      }).not.toThrowError();

      isPageVisibleHarness.setVisible(false);
      isPageVisibleHarness.setVisible(true);
      expectRequest();
    });
  });

  it('handles unsubscribing when it never acquired a lock', () => {
    ctx.run(() => {
      isPageVisibleHarness.setVisible(false);
      expect(() => {
        keepWakeLock$().subscribe().unsubscribe();
      }).not.toThrowError();
    });
  });

  it('gracefully handles a browser without navigator.wakelock', () => {
    spyOnProperty(navigator as any, 'wakeLock').and.returnValue(undefined);
    ctx.run(async () => {
      expect(() => {
        keepWakeLock$().subscribe();
      }).not.toThrowError();
    });
  });
});
