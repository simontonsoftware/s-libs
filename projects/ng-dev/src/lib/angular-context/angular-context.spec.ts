import { OverlayContainer } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  DoCheck,
  Injectable,
  InjectionToken,
  Injector,
} from '@angular/core';
import { flush, TestBed, tick } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { sleep } from '@s-libs/js-core';
import { noop, Observable } from 'rxjs';
import { AngularContext } from './angular-context';

describe('AngularContext', () => {
  class SnackBarContext extends AngularContext {
    constructor() {
      super({ imports: [MatSnackBarModule, NoopAnimationsModule] });
    }

    protected cleanUp(): void {
      this.inject(OverlayContainer).ngOnDestroy();
      flush();
      super.cleanUp();
    }
  }

  describe('.startTime', () => {
    it('controls the time at which the test starts', () => {
      const ctx = new AngularContext();
      ctx.startTime = new Date('2012-07-14T21:42:17.523Z');
      ctx.run(() => {
        expect(new Date()).toEqual(new Date('2012-07-14T21:42:17.523Z'));
      });
    });

    it('defaults to the current time', () => {
      const ctx = new AngularContext();
      const now = Date.now();
      ctx.run(() => {
        expect(Date.now()).toBeCloseTo(now, -1);
      });
    });
  });

  describe('constructor', () => {
    it('accepts module metadata to be bootstrapped', () => {
      const value = Symbol();
      const token = new InjectionToken<symbol>('tok');
      const ctx = new AngularContext({
        providers: [{ provide: token, useValue: value }],
      });
      ctx.run(() => {
        expect(ctx.inject(token)).toBe(value);
      });
    });

    it('sets up HttpClientTestingModule', () => {
      const ctx = new AngularContext();
      ctx.run(() => {
        expect(ctx.inject(HttpTestingController)).toBeDefined();
      });
    });
  });

  describe('.run()', () => {
    it('uses the fakeAsync zone', () => {
      const ctx = new AngularContext();
      ctx.run(() => {
        expect(tick).not.toThrow();
      });
    });

    it('can handle async tests that call tick', () => {
      let completed = false;
      const ctx = new AngularContext();
      ctx.run(async () => {
        await sleep(0);
        setTimeout(() => {
          completed = true;
        }, 500);
        ctx.tick(500);
      });
      expect(completed).toBeTrue();
    });
  });

  describe('.inject()', () => {
    it('fetches from the root injector', () => {
      const ctx = new AngularContext();
      ctx.run(() => {
        expect(ctx.inject(Injector)).toBe(TestBed.inject(Injector));
      });
    });
  });

  describe('.getHarness()', () => {
    it('returns a harness', () => {
      const ctx = new SnackBarContext();
      ctx.run(async () => {
        ctx.inject(MatSnackBar).open('hi');
        const bar = await ctx.getHarness(MatSnackBarHarness);
        expect(await bar.getMessage()).toBe('hi');
      });
    });
  });

  describe('.getAllHarnesses()', () => {
    it('gets an array of harnesses', () => {
      const ctx = new SnackBarContext();
      ctx.run(async () => {
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
    it('defaults to not advance time', () => {
      const ctx = new AngularContext();
      const start = ctx.startTime.getTime();
      ctx.run(() => {
        ctx.tick();
        expect(Date.now()).toBe(start);
      });
    });

    it('defaults to advancing in milliseconds', () => {
      const ctx = new AngularContext();
      const start = ctx.startTime.getTime();
      ctx.run(() => {
        ctx.tick(10);
        expect(Date.now()).toBe(start + 10);
      });
    });

    it('allows specifying the units to advance', () => {
      const ctx = new AngularContext();
      const start = ctx.startTime.getTime();
      ctx.run(() => {
        ctx.tick(10, 'sec');
        expect(Date.now()).toBe(start + 10000);
      });
    });

    it('runs change detection even if no tasks are queued', () => {
      let ranChangeDetection = false;

      @Component({ template: '' })
      class LocalComponent implements DoCheck {
        ngDoCheck(): void {
          ranChangeDetection = true;
        }
      }
      TestBed.overrideComponent(LocalComponent, {});

      const ctx = new AngularContext();
      ctx.run(() => {
        const resolver = ctx.inject(ComponentFactoryResolver);
        const factory = resolver.resolveComponentFactory(LocalComponent);
        const componentRef = factory.create(ctx.inject(Injector));
        ctx.inject(ApplicationRef).attachView(componentRef.hostView);

        expect(ranChangeDetection).toBe(false);
        ctx.tick();
        expect(ranChangeDetection).toBe(true);
      });
    });

    it('flushes micro tasks before running change detection', () => {
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
      ctx.run(() => {
        const resolver = ctx.inject(ComponentFactoryResolver);
        const factory = resolver.resolveComponentFactory(LocalComponent);
        const componentRef = factory.create(ctx.inject(Injector));
        ctx.inject(ApplicationRef).attachView(componentRef.hostView);

        Promise.resolve().then(() => {
          flushedMicroTasksBeforeChangeDetection = !ranChangeDetection;
        });
        ctx.tick();
        expect(flushedMicroTasksBeforeChangeDetection).toBe(true);
      });
    });

    it('runs change detection after timeouts', () => {
      let ranTimeout = false;
      let ranChangeDetectionAfterTimeout = false;

      @Component({ template: '' })
      class LocalComponent implements DoCheck {
        ngDoCheck(): void {
          ranChangeDetectionAfterTimeout = ranTimeout;
        }
      }
      TestBed.overrideComponent(LocalComponent, {});

      const ctx = new AngularContext();
      ctx.run(() => {
        const resolver = ctx.inject(ComponentFactoryResolver);
        const factory = resolver.resolveComponentFactory(LocalComponent);
        const componentRef = factory.create(ctx.inject(Injector));
        ctx.inject(ApplicationRef).attachView(componentRef.hostView);

        setTimeout(() => {
          ranTimeout = true;
        });
        ctx.tick();
        expect(ranChangeDetectionAfterTimeout).toBe(true);
      });
    });

    it('advances `performance.now()`', () => {
      const ctx = new AngularContext();
      ctx.run(() => {
        const start = performance.now();
        ctx.tick(10);
        expect(performance.now()).toBe(start + 10);
      });
    });
  });

  describe('.verifyPostTestConditions()', () => {
    it('errs if there are unexpected http requests', () => {
      const ctx = new AngularContext();
      expect(() => {
        ctx.run(() => {
          ctx.inject(HttpClient).get('an unexpected URL').subscribe();
        });
      }).toThrowError(
        'Expected no open requests, found 1: GET an unexpected URL',
      );
    });
  });

  describe('.cleanUp()', () => {
    it('discards periodic tasks', () => {
      const ctx = new AngularContext();
      expect(() => {
        ctx.run(() => {
          setInterval(noop, 10);
        });
      })
        // No error: "1 periodic timer(s) still in the queue."
        .not.toThrowError();
    });

    it('flushes pending timeouts', () => {
      const ctx = new AngularContext();
      expect(() => {
        ctx.run(() => {
          setTimeout(noop, 1);
        });
      })
        // No error: "1 timer(s) still in the queue."
        .not.toThrowError();
    });
  });
});

describe('AngularContext class-level doc example', () => {
  // This is the class we will test.
  @Injectable({ providedIn: 'root' })
  class MemoriesService {
    constructor(private httpClient: HttpClient) {}

    getLastYearToday(): Observable<any> {
      const datetime = new Date();
      datetime.setFullYear(datetime.getFullYear() - 1);
      const date = datetime.toISOString().split('T')[0];
      return this.httpClient.get(`http://example.com/post-from/${date}`);
    }
  }

  describe('MemoriesService', () => {
    // Tests should have exactly 1 variable outside an "it": `ctx`.
    let ctx: AngularContext;
    beforeEach(() => {
      ctx = new AngularContext();
    });

    it('requests a post from 1 year ago', () => {
      // Before calling `run`, set up any context variables this test needs.
      ctx.startTime = new Date('2004-02-16T10:15:00.000Z');

      // Pass the test itself as a callback to `run()`.
      ctx.run(() => {
        const httpBackend = ctx.inject(HttpTestingController);
        const myService = ctx.inject(MemoriesService);

        myService.getLastYearToday().subscribe();

        httpBackend.expectOne('http://example.com/post-from/2003-02-16');
      });
      expect().nothing();
    });
  });
});
