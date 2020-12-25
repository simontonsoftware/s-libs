import {
  Component,
  InjectionToken,
  Input,
  NgModule,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import {
  ANIMATION_MODULE_TYPE,
  BrowserAnimationsModule,
} from '@angular/platform-browser/animations';
import { noop } from '@s-libs/micro-dash';
import { ComponentContextNext } from './component-context-next';

describe('ComponentContextNext', () => {
  let ngOnChangesSpy: jasmine.Spy;

  @Component({ template: 'Hello, {{name}}!' })
  class TestComponent {
    @Input() name!: string;
  }

  @Component({ template: '' })
  class ChangeDetectingComponent implements OnChanges {
    @Input() myInput?: string;

    ngOnChanges(changes: SimpleChanges): void {
      ngOnChangesSpy(changes);
    }
  }

  beforeEach(() => {
    ngOnChangesSpy = jasmine.createSpy();
  });

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

    it('allows defaults to be overridden', () => {
      const ctx = new ComponentContextNext(TestComponent, {
        imports: [BrowserAnimationsModule],
      });
      ctx.run(() => {
        expect(ctx.inject(ANIMATION_MODULE_TYPE)).toBe('NoopAnimations');
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

    it('accepts component input', () => {
      const ctx = new ComponentContextNext(TestComponent);
      ctx.run({ inputs: { name: 'Default Guy' } }, () => {
        expect(ctx.fixture.nativeElement.textContent).toContain('Default Guy');
      });
    });

    it('triggers ngOnChanges', () => {
      const ctx = new ComponentContextNext(ChangeDetectingComponent);
      ctx.run(() => {
        expect(ngOnChangesSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('.getComponentInstance()', () => {
    it('returns the instantiated component', () => {
      const ctx = new ComponentContextNext(TestComponent);
      ctx.run({ inputs: { name: 'instantiated name' } }, () => {
        expect(ctx.getComponentInstance().name).toBe('instantiated name');
      });
    });
  });

  describe('.updateInputs()', () => {
    it('updates the inputs', () => {
      const ctx = new ComponentContextNext(TestComponent);
      ctx.run(() => {
        ctx.updateInputs({ name: 'New Guy' });
        expect(ctx.fixture.nativeElement.textContent).toContain('New Guy');
      });
    });

    it('triggers ngOnChanges() with the proper changes argument', () => {
      const ctx = new ComponentContextNext(ChangeDetectingComponent);
      ctx.run(() => {
        ngOnChangesSpy.calls.reset();
        ctx.updateInputs({ myInput: 'new value' });
        expect(ngOnChangesSpy).toHaveBeenCalledTimes(1);
        const changes: SimpleChanges = ngOnChangesSpy.calls.mostRecent()
          .args[0];
        expect(changes.myInput.currentValue).toBe('new value');
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
      ctx.run(() => {
        setInterval(noop, 10);
      });
      // The test is that it does _not_ give the error: "1 periodic timer(s) still in the queue."
      expect().nothing();
    });
  });

  describe('.validateInputs()', () => {
    it('errors with a nice message when given a non-input', () => {
      @Component({ template: '' })
      class NonInputComponent {
        nonInput?: string;
        // tslint:disable-next-line:no-input-rename
        @Input('nonInput') letsTryToTrickIt?: string;
      }

      const ctx = new ComponentContextNext(NonInputComponent);
      ctx.run(() => {
        expect(() => {
          ctx.updateInputs({ nonInput: 'value' });
        }).toThrowError(
          'Cannot bind to "nonInput" (it is not an input, or you passed it in `unboundProperties`)',
        );
      });
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
        ctx.run({ inputs: { doNotBind: "I'll do what I want" } }, noop);
      }).toThrowError(
        'Cannot bind to "doNotBind" (it is not an input, or you passed it in `unboundProperties`)',
      );
    });
  });
});

describe('ComponentContextNext class-level doc example', () => {
  @Component({ template: 'Hello, {{name}}!' })
  class GreeterComponent {
    @Input() name!: string;
  }

  it('greets you by name', () => {
    const ctx = new ComponentContextNext(GreeterComponent);
    ctx.run({ inputs: { name: 'World' } }, () => {
      expect(ctx.fixture.nativeElement.textContent).toBe('Hello, World!');
    });
  });
});
