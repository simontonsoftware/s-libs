import {
  AngularContext,
  AsyncMethodController,
  expectSingleCallAndReset,
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
  let request: AsyncMethodController<WakeLock, 'request'>;
  let visibilityState: jasmine.Spy;
  let notifyVisibilityChange: VoidFunction | undefined;
  beforeEach(() => {
    ctx = new AngularContext();
    request = new AsyncMethodController(nav.wakeLock!, 'request');
    visibilityState = spyOnProperty(
      document,
      'visibilityState',
    ).and.returnValue('visible');
    spyOn(document, 'addEventListener')
      .withArgs('visibilitychange', jasmine.anything(), undefined)
      .and.callFake(
        (_: string, handler: EventListenerOrEventListenerObject) => {
          notifyVisibilityChange = handler as VoidFunction;
        },
      );
  });

  afterEach(() => {
    notifyVisibilityChange = undefined;
  });

  function setVisibility(value: VisibilityState): void {
    visibilityState.and.returnValue(value);
    notifyVisibilityChange?.();
    ctx.tick();
  }

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
      setVisibility('hidden');
      keepWakeLock$().subscribe();
      request.verify();
      setVisibility('visible');
      expectRequest();
    });
  });

  it('resubscribes whenever the screen becomes visible', () => {
    ctx.run(() => {
      keepWakeLock$().subscribe();
      expectRequest();

      setVisibility('hidden');
      setVisibility('visible');
      expectRequest();

      setVisibility('hidden');
      setVisibility('visible');
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

      setVisibility('hidden');
      setVisibility('visible');
      expectRequest();
    });
  });

  it('handles unsubscribing when it never acquired a lock', () => {
    ctx.run(() => {
      setVisibility('hidden');
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
