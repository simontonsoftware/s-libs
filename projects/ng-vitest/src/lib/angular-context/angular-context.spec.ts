import { OverlayContainer } from '@angular/cdk/overlay';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import {
  APP_ID,
  ApplicationRef,
  Component,
  DoCheck,
  effect,
  EnvironmentProviders,
  ErrorHandler,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  provideAppInitializer,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { Deferred } from '@s-libs/js-core';
import { MockErrorHandler } from '@s-libs/ng-dev';
import { noop, Observable } from 'rxjs';
import { ComponentContext } from '../component-context/component-context';
import { AngularContext } from './angular-context';
import { FakeTimerHarnessEnvironment } from './fake-timer-harness-environment';

describe('AngularContext', () => {
  class SnackBarContext extends AngularContext {
    constructor() {
      super({ imports: [MatSnackBarModule] });
    }

    protected override async cleanUp(): Promise<void> {
      this.inject(OverlayContainer).ngOnDestroy();
      await super.cleanUp();
    }
  }

  describe('.getCurrent()', () => {
    it('returns the currently running angular context', async () => {
      expect(AngularContext.getCurrent()).toBeUndefined();

      const ctx = new AngularContext();
      await ctx.run(() => {
        expect(AngularContext.getCurrent()).toBe(ctx);
      });

      expect(AngularContext.getCurrent()).toBeUndefined();
    });
  });

  describe('.startTime', () => {
    it('controls the time at which the test starts', async () => {
      const ctx = new AngularContext();
      ctx.startTime = new Date('2012-07-14T21:42:17.523Z');
      await ctx.run(() => {
        expect(new Date()).toEqual(new Date('2012-07-14T21:42:17.523Z'));
      });
    });

    it('defaults to the current time', async () => {
      const ctx = new AngularContext();
      const now = Date.now();
      await ctx.run(() => {
        expect(Date.now()).toBeCloseTo(now, -2);
      });
    });
  });

  describe('constructor', () => {
    it('accepts module metadata to be bootstrapped', async () => {
      const value = Symbol('');
      const token = new InjectionToken<symbol>('tok');
      const ctx = new AngularContext({
        providers: [{ provide: token, useValue: value }],
      });
      await ctx.run(() => {
        expect(ctx.inject(token)).toBe(value);
      });
    });

    // it('sets up http client testing', () => {
    //   const ctx = new AngularContext({ providers: [provideHttpClient()] });
    //   ctx.run(() => {
    //     ctx.inject(HttpClient).get('some URL').subscribe();
    //     expectRequest('GET', 'some URL');
    //   });
    // });

    // // this is more sensitive than the test above, since `provideHttpClientTesting()` has to end up _after_ `provideHttpClient()` to work properly
    // it('sets up testing for `provideHttpClient()`', () => {
    //   const ctx = new AngularContext({ providers: [provideHttpClient()] });
    //   ctx.run(() => {
    //     ctx.inject(HttpClient).get('some URL').subscribe();
    //     expectRequest('GET', 'some URL');
    //   });
    // });

    it('sets up MockErrorHandler', async () => {
      const ctx = new AngularContext();
      await ctx.run(() => {
        expect(ctx.inject(ErrorHandler)).toEqual(expect.any(MockErrorHandler));
      });
    });

    it('allows the user to override MockErrorHandler', async () => {
      const errorHandler = { handleError: noop };
      const ctx = new AngularContext({
        providers: [{ provide: ErrorHandler, useValue: errorHandler }],
      });
      await ctx.run(() => {
        expect(ctx.inject(ErrorHandler)).toBe(errorHandler);
      });
    });

    it('disables animations', async () => {
      const ctx = new AngularContext();
      await ctx.run(() => {
        expect(ctx.inject(MATERIAL_ANIMATIONS)).toEqual({
          animationsDisabled: true,
        });
      });
    });

    it('allows the user to override MATERIAL_ANIMATIONS', async () => {
      const ctx = new AngularContext({
        providers: [{ provide: MATERIAL_ANIMATIONS, useValue: {} }],
      });
      await ctx.run(() => {
        expect(ctx.inject(MATERIAL_ANIMATIONS)).toEqual({});
      });
    });

    it('gives a nice error message if trying to use 2 at the same time', async () => {
      await new AngularContext().run(async () => {
        expect(() => {
          // eslint-disable-next-line no-new -- nothing more is needed for this test
          new AngularContext();
        }).toThrow(
          'There is already another AngularContext in use (or it was not cleaned up)',
        );
      });
    });
  });

  describe('.run()', () => {
    it('can handle async tests that call tick', async () => {
      let completed = false;
      const ctx = new AngularContext();
      await ctx.run(async () => {
        setTimeout(() => {
          completed = true;
        }, 500);
        await ctx.tick(500);
      });
      expect(completed).toBe(true);
    });

    it('can catch "inject() must be called from an injection context" errors (pre-release design flaw)', async () => {
      // In 16.0.0-next.0 I added the ability to use `inject()` inside test code. That's cool, but it also could mask a production bug!
      await new AngularContext().run(() => {
        expect(() => {
          inject(APP_ID);
        }).toThrow();
      });
    });

    it('does not swallow errors (production bug)', async () => {
      await expect(
        new AngularContext().run(() => {
          throw new Error();
        }),
      ).rejects.toThrow();
    });

    describe('next test run', () => {
      async function runInitTest(): Promise<void> {
        class BadInitContext extends AngularContext {
          protected override async init(): Promise<void> {
            await super.init();
            throw new Error('mess up init');
          }
        }
        const ctx = new BadInitContext();
        await expect(ctx.run(noop)).rejects.toThrow('mess up init');
      }

      async function runCleanupTest(): Promise<void> {
        class NonCleanup extends AngularContext {
          protected override async cleanUp(): Promise<void> {
            throw new Error('mess up cleanup');
          }
        }
        const ctx = new NonCleanup();
        await expect(ctx.run(noop)).rejects.toThrow('mess up cleanup');
      }

      it('is OK when throwing an error during init', runInitTest);
      it('is OK when throwing an error during init', runInitTest);

      it('is OK when throwing an error during cleanup', runCleanupTest);
      it('is OK when throwing an error during cleanup', runCleanupTest);
    });
  });

  describe('.isRunning()', () => {
    it('works', async () => {
      const ctx = new AngularContext();
      expect(ctx.isRunning()).toBe(false);
      await ctx.run(() => {
        expect(ctx.isRunning()).toBe(true);
      });
      expect(ctx.isRunning()).toBe(false);
    });
  });

  describe('.inject()', () => {
    it('fetches from the root injector', async () => {
      const ctx = new AngularContext();
      await ctx.run(() => {
        expect(ctx.inject(Injector)).toBe(TestBed.inject(Injector));
      });
    });
  });

  describe('.hasHarness()', () => {
    it('returns whether a match for the harness exists', async () => {
      const ctx = new SnackBarContext();
      await ctx.run(async () => {
        expect(await ctx.hasHarness(MatSnackBarHarness)).toBe(false);

        ctx.inject(MatSnackBar).open('hi');
        expect(await ctx.hasHarness(MatSnackBarHarness)).toBe(true);
      });
    });
  });

  describe('.getHarness()', () => {
    it('returns a harness', async () => {
      const ctx = new SnackBarContext();
      await ctx.run(async () => {
        ctx.inject(MatSnackBar).open('hi');
        const bar = await ctx.getHarness(MatSnackBarHarness);
        expect(await bar.getMessage()).toBe('hi');
      });
    });
  });

  describe('.getHarnessOrNull()', () => {
    it('returns a harness or null', async () => {
      const ctx = new SnackBarContext();
      await ctx.run(async () => {
        expect(await ctx.getHarnessOrNull(MatSnackBarHarness)).toBe(null);

        ctx.inject(MatSnackBar).open('hi');
        expect(await ctx.getHarnessOrNull(MatSnackBarHarness)).not.toBe(null);
      });
    });
  });

  describe('.getAllHarnesses()', () => {
    it('gets an array of harnesses', async () => {
      const ctx = new SnackBarContext();
      await ctx.run(async () => {
        let bars = await ctx.getAllHarnesses(MatSnackBarHarness);
        expect(bars.length).toBe(0);
        ctx.inject(MatSnackBar).open('hi');
        bars = await ctx.getAllHarnesses(MatSnackBarHarness);
        expect(bars.length).toBe(1);
        expect(await bars[0].getMessage()).toBe('hi');
      });
    });
  });

  describe('.tick()', () => {
    it('defaults to not advance time', async () => {
      const ctx = new AngularContext();
      const start = ctx.startTime.getTime();
      await ctx.run(async () => {
        await ctx.tick();
        expect(Date.now()).toBe(start);
      });
    });

    it('defaults to advancing in milliseconds', async () => {
      const ctx = new AngularContext();
      const start = ctx.startTime.getTime();
      await ctx.run(async () => {
        await ctx.tick(10);
        expect(Date.now()).toBe(start + 10);
      });
    });

    it('allows specifying the units to advance', async () => {
      const ctx = new AngularContext();
      const start = ctx.startTime.getTime();
      await ctx.run(async () => {
        await ctx.tick(10, 'sec');
        expect(Date.now()).toBe(start + 10000);
      });
    });

    it('runs change detection even if no tasks are queued', async () => {
      let ranChangeDetection = false;

      @Component({ template: '' })
      class LocalComponent implements DoCheck {
        ngDoCheck(): void {
          ranChangeDetection = true;
        }
      }
      TestBed.overrideComponent(LocalComponent, {});

      const ctx = new AngularContext();
      await ctx.run(async () => {
        const fixture = TestBed.createComponent(LocalComponent);
        ctx.inject(ApplicationRef).attachView(fixture.componentRef.hostView);

        expect(ranChangeDetection).toBe(false);
        await ctx.tick();
        expect(ranChangeDetection).toBe(true);
      });
    });

    it('flushes micro tasks before running change detection', async () => {
      let ranChangeDetection = false;
      let flushedMicroTasksBeforeChangeDetection = false;

      @Component({ template: '' })
      class LocalComponent implements DoCheck {
        ngDoCheck(): void {
          ranChangeDetection = true;
        }
      }
      TestBed.overrideComponent(LocalComponent, {});

      const ctx = new AngularContext();
      await ctx.run(async () => {
        const fixture = TestBed.createComponent(LocalComponent);
        ctx.inject(ApplicationRef).attachView(fixture.componentRef.hostView);

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Promise.resolve().then(() => {
          flushedMicroTasksBeforeChangeDetection = !ranChangeDetection;
        });
        await ctx.tick();
        expect(flushedMicroTasksBeforeChangeDetection).toBe(true);
      });
    });

    it('settles microtasks queued from effects (prod bug)', async () => {
      const ctx = new AngularContext();
      await ctx.run(async () => {
        const source = signal(false);
        let result = false;
        TestBed.runInInjectionContext(() => {
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          effect(async () => {
            const val = source();
            await Promise.resolve(); // must be native await, not .then(), to trigger one of the bugs
            result = val;
          });
        });
        setTimeout(() => {
          source.set(true);
        });

        await ctx.tick();

        expect(result).toBe(true);
      });
    });

    it('advances `performance.now()`', async () => {
      const ctx = new AngularContext();
      await ctx.run(async () => {
        const start = performance.now();
        await ctx.tick(10);
        expect(performance.now()).toBe(start + 10);
      });
    });

    it('gives a nice error message when you try to use it outside `run()`', async () => {
      const ctx = new AngularContext();
      await expect(ctx.tick()).rejects.toThrow(
        ".tick() only works inside the .run() callback (because it needs Vitest's fake timers)",
      );
      await ctx.run(noop);
    });

    describe('change detection after a timeout', () => {
      async function runTest(
        providers: EnvironmentProviders[],
        expectChangeDetection: boolean,
      ): Promise<void> {
        let ranTimeout = false;
        let ranChangeDetectionAfterTimeout = false;

        @Component({ template: '' })
        class LocalComponent implements DoCheck {
          ngDoCheck(): void {
            ranChangeDetectionAfterTimeout = ranTimeout;
          }
        }
        TestBed.overrideComponent(LocalComponent, {});

        const ctx = new AngularContext({ providers });
        await ctx.run(async () => {
          const fixture = TestBed.createComponent(LocalComponent);
          ctx.inject(ApplicationRef).attachView(fixture.componentRef.hostView);

          setTimeout(() => {
            ranTimeout = true;
          });
          await ctx.tick();
          expect(ranChangeDetectionAfterTimeout).toBe(expectChangeDetection);
        });
      }

      // it('runs with zone', async () => {
      //   await runTest([provideZoneChangeDetection()], true);
      // });

      it('does not run without zone', async () => {
        await runTest([provideZonelessChangeDetection()], false);
      });
    });
  });

  describe('.init()', async () => {
    it('waits for async app init', async () => {
      const deferred = new Deferred<void>();
      let testRan = false;

      const ctx = new AngularContext({
        providers: [provideAppInitializer(async () => deferred.promise)],
      });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      ctx.run(() => {
        testRan = true;
      });

      await vi.advanceTimersByTimeAsync(0);
      expect(testRan).toBe(false);

      deferred.resolve();
      await vi.advanceTimersByTimeAsync(0);
      expect(testRan).toBe(true);
    });
  });

  describe('.verifyPostTestConditions()', () => {
    it('errs if there are unexpected http requests', async () => {
      const ctx = new AngularContext({ providers: [provideHttpClient()] });
      await expect(
        ctx.run(() => {
          ctx.inject(HttpClient).get('an unexpected URL').subscribe();
        }),
      ).rejects.toThrow(
        'Expected no open requests, found 1: GET an unexpected URL',
      );
    });

    it('errs if there are unexpected errors', async () => {
      @Component({
        template: '<button (click)="throwError()">Break Me</button>',
      })
      class ThrowingComponent {
        throwError(): never {
          throw new Error();
        }
      }

      const ctx = new ComponentContext(ThrowingComponent);
      await expect(
        ctx.run(async () => {
          let intercepted = false;
          window.addEventListener(
            'error',
            () => {
              // without this no-op listener, vitest reports an unhandled error and fails the test run ¯\_(ツ)_/¯
              intercepted = true;
            },
            { once: true },
          );

          const loader = FakeTimerHarnessEnvironment.documentRootLoader(ctx);
          const button = await loader.locatorFor('button')();
          await button.click();

          // sanity check that the handler ran (and therefore was removed because of the { once: true })
          expect(intercepted).toBe(true);
        }),
      ).rejects.toThrow();
    });
  });
});

describe('AngularContext class-level doc example', () => {
  // This is the class we will test.
  @Injectable({ providedIn: 'root' })
  class MemoriesService {
    #httpClient = inject(HttpClient);

    getLastYearToday(): Observable<any> {
      const datetime = new Date();
      datetime.setFullYear(datetime.getFullYear() - 1);
      const date = datetime.toISOString().split('T')[0];
      return this.#httpClient.get(`http://example.com/post-from/${date}`);
    }
  }

  describe('MemoriesService', () => {
    // Tests should have exactly 1 variable outside an "it": `ctx`.
    let ctx: AngularContext;
    beforeEach(() => {
      ctx = new AngularContext({ providers: [provideHttpClient()] });
    });

    it('requests a post from 1 year ago', async () => {
      // Before calling `run`, set up any context variables this test needs.
      ctx.startTime = new Date('2004-02-16T10:15:00.000Z');

      // Pass the test itself as a callback to `run()`.
      await ctx.run(() => {
        const httpBackend = ctx.inject(HttpTestingController);
        const myService = ctx.inject(MemoriesService);

        myService.getLastYearToday().subscribe();

        httpBackend.expectOne('http://example.com/post-from/2003-02-16');
      });
    });
  });
});
