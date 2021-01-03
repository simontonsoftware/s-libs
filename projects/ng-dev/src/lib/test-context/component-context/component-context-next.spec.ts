import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentHarness } from '@angular/cdk/testing';
import {
  Component,
  InjectionToken,
  Input,
  NgModule,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { BrowserModule } from '@angular/platform-browser';
import {
  ANIMATION_MODULE_TYPE,
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { noop } from '@s-libs/micro-dash';
import { ComponentContextNext } from './component-context-next';

describe('ComponentContextNext', () => {
  @Component({ template: 'Hello, {{name}}!' })
  class TestComponent {
    @Input() name!: string;
  }

  @Component({ template: '' })
  class ChangeDetectingComponent implements OnChanges {
    @Input() myInput?: string;
    ngOnChangesSpy = jasmine.createSpy();

    ngOnChanges(changes: SimpleChanges): void {
      this.ngOnChangesSpy(changes);
    }
  }

  class SnackBarContext extends ComponentContextNext<TestComponent> {
    constructor() {
      super(TestComponent, {
        imports: [MatSnackBarModule, NoopAnimationsModule],
      });
    }

    protected cleanUp(): void {
      this.inject(OverlayContainer).ngOnDestroy();
      this.tick(5000);
      super.cleanUp();
    }
  }

  describe('.fixture', () => {
    it('is provided', () => {
      const ctx = new ComponentContextNext(TestComponent);
      ctx.run(() => {
        expect(ctx.fixture).toBeInstanceOf(ComponentFixture);
      });
    });
  });

  describe('constructor', () => {
    it('accepts module metadata to be bootstrapped', () => {
      const value = Symbol();
      const token = new InjectionToken<symbol>('tok');
      const ctx = new ComponentContextNext(TestComponent, {
        providers: [{ provide: token, useValue: value }],
      });
      ctx.run(() => {
        expect(ctx.inject(token)).toBe(value);
      });
    });

    it('disables animations', () => {
      @NgModule({ imports: [BrowserAnimationsModule] })
      class AnimatedModule {}
      const ctx = new ComponentContextNext(TestComponent, {
        imports: [AnimatedModule],
      });
      ctx.run(() => {
        expect(ctx.inject(ANIMATION_MODULE_TYPE)).toBe('NoopAnimations');
      });
    });

    it('allows default module metadata to be overridden', () => {
      const ctx = new ComponentContextNext(TestComponent, {
        imports: [BrowserAnimationsModule],
      });
      ctx.run(() => {
        expect(ctx.inject(ANIMATION_MODULE_TYPE)).toBe('NoopAnimations');
      });
    });
  });

  describe('.assignInputs()', () => {
    it('updates the inputs', () => {
      const ctx = new ComponentContextNext(TestComponent);
      ctx.run(() => {
        ctx.assignInputs({ name: 'New Guy' });
        expect(ctx.fixture.nativeElement.textContent).toContain('New Guy');
      });
    });

    it('triggers ngOnChanges() with the proper changes argument', () => {
      const ctx = new ComponentContextNext(ChangeDetectingComponent);
      ctx.run(() => {
        const spy = ctx.getComponentInstance().ngOnChangesSpy;
        spy.calls.reset();
        ctx.assignInputs({ myInput: 'new value' });
        expect(spy).toHaveBeenCalledTimes(1);
        const changes: SimpleChanges = spy.calls.mostRecent().args[0];
        expect(changes.myInput.currentValue).toBe('new value');
      });
    });

    it('errors with a nice message when given a non-input', () => {
      @Component({ template: '' })
      class NonInputComponent {
        nonInput?: string;
        // tslint:disable-next-line:no-input-rename
        @Input('nonInput') letsTryToTrickIt?: string;
      }

      const ctx = new ComponentContextNext(NonInputComponent);
      expect(() => {
        ctx.assignInputs({ nonInput: 'value' });
      }).toThrowError(
        'Cannot bind to "nonInput" (it is not an input, or you passed it in `unboundProperties`)',
      );
    });

    it('errors with a nice message when given an unbound input', () => {
      @Component({ template: '' })
      class UnboundInputComponent {
        @Input() doNotBind?: string;
      }
      const ctx = new ComponentContextNext(UnboundInputComponent, {}, [
        'doNotBind',
      ]);
      expect(() => {
        ctx.assignInputs({ doNotBind: "I'll do what I want" });
      }).toThrowError(
        'Cannot bind to "doNotBind" (it is not an input, or you passed it in `unboundProperties`)',
      );
    });
  });

  describe('.getComponentInstance()', () => {
    it('returns the instantiated component', () => {
      const ctx = new ComponentContextNext(TestComponent);
      ctx.assignInputs({ name: 'instantiated name' });
      ctx.run(() => {
        expect(ctx.getComponentInstance().name).toBe('instantiated name');
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

  describe('.init()', () => {
    it('creates a component of the type specified in the constructor', () => {
      const ctx = new ComponentContextNext(TestComponent);
      ctx.run(() => {
        expect(ctx.getComponentInstance()).toBeInstanceOf(TestComponent);
      });
    });

    it('trims leftover styles', () => {
      const ctx = new ComponentContextNext(TestComponent);
      let style: HTMLStyleElement;
      ctx.run(() => {
        style = document.createElement('style');
        document.head.append(style);
      });
      ctx.run(() => {
        expect(style.parentElement).toBeNull();
      });
    });

    it('triggers ngOnChanges', () => {
      const ctx = new ComponentContextNext(ChangeDetectingComponent);
      ctx.run(() => {
        const spy = ctx.getComponentInstance().ngOnChangesSpy;
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('.runChangeDetection()', () => {
    it('gets change detection working inside the fixture', () => {
      const ctx = new ComponentContextNext(TestComponent);
      ctx.run(() => {
        ctx.getComponentInstance().name = 'Changed Guy';
        ctx.tick();
        expect(ctx.fixture.nativeElement.textContent).toContain('Changed Guy');
      });
    });
  });

  describe('.cleanUp()', () => {
    it('destroys the fixture', () => {
      const ctx = new ComponentContextNext(TestComponent);
      ctx.run(noop);
      ctx.getComponentInstance().name = 'Changed Guy';
      ctx.fixture.detectChanges();
      expect(ctx.fixture.nativeElement.textContent).not.toContain(
        'Changed Guy',
      );
    });

    it('does the superclass things', () => {
      const ctx = new ComponentContextNext(TestComponent);
      expect(() => {
        ctx.run(() => {
          setInterval(noop, 10);
        });
      })
        // No error: "1 periodic timer(s) still in the queue."
        .not.toThrowError();
    });
  });
});

describe('ComponentContextNext class-level doc examples', () => {
  describe('simple example', () => {
    @Component({ template: 'Hello, {{name}}!' })
    class GreeterComponent {
      @Input() name!: string;
    }

    it('greets you by name', () => {
      const ctx = new ComponentContextNext(GreeterComponent);
      ctx.assignInputs({ name: 'World' });
      ctx.run(() => {
        expect(ctx.fixture.nativeElement.textContent).toBe('Hello, World!');
      });
    });
  });

  describe('full example with routing', () => {
    /////////////////
    // app-context.ts

    // To re-use your context setup, make a subclass of ComponentContext to import into any spec
    class AppContext extends ComponentContextNext<AppComponent> {
      constructor() {
        super(AppComponent, {
          imports: [
            // This is your production `AppModule`. Make 1 tweak there: export `AppComponent`
            AppModule,
            // Import `routes` from your `app-routing.module.ts`
            RouterTestingModule.withRoutes(routes),
          ],
        });
      }
    }

    ////////////////////////
    // app.component.spec.ts

    describe('AppComponent', () => {
      let ctx: AppContext;
      beforeEach(() => {
        ctx = new AppContext();
      });

      it('can navigate to the first page', () => {
        ctx.run(async () => {
          const app = await ctx.getHarness(AppComponentHarness);
          await app.navigateToFirstPage();
          expect(ctx.fixture.nativeElement.textContent).toContain(
            'First works!',
          );
        });
      });
    });

    ///////////////////////////
    // app.component.harness.ts

    // A simple component harness to demonstrate its integration with component contexts
    class AppComponentHarness extends ComponentHarness {
      static hostSelector = 'app-root';

      private getFirstPageLink = this.locatorFor('a');

      async navigateToFirstPage(): Promise<void> {
        const link = await this.getFirstPageLink();
        await link.click();
      }
    }

    /////////////////////
    // first.component.ts

    // A minimal component for demonstration purposes
    @Component({ template: '<p>First works!</p>' })
    class FirstComponent {}

    ///////////////////
    // app.component.ts

    // A minimal app component with routing for demonstration purposes
    @Component({
      selector: 'app-root',
      template: `
        <a routerLink="/first-page">First Page</a>
        <router-outlet></router-outlet>
      `,
    })
    class AppComponent {}

    ////////////////////////
    // app-routing.module.ts

    // exported for use in tests
    const routes: Routes = [{ path: 'first-page', component: FirstComponent }];

    @NgModule({
      imports: [RouterModule.forRoot(routes)],
      exports: [RouterModule],
    })
    class AppRoutingModule {}

    ////////////////
    // app.module.ts

    // A minimal app module. Notice the added export.
    @NgModule({
      declarations: [AppComponent, FirstComponent],
      imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule],
      bootstrap: [AppComponent],
      exports: [AppComponent], // exported for use in tests
    })
    class AppModule {}
  });
});
