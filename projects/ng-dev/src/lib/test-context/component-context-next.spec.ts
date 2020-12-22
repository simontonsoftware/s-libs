import { Component, InjectionToken, Input, NgModule } from '@angular/core';
import {
  ANIMATION_MODULE_TYPE,
  BrowserAnimationsModule,
} from '@angular/platform-browser/animations';
import { noop } from '@s-libs/micro-dash';
import { ComponentContextNext } from './component-context-next';

describe('ComponentContextNext', () => {
  @Component({ template: 'Hello, {{name}}!' })
  class TestComponent {
    @Input() name!: string;
  }

  describe('.fixture', () => {
    it('is provided', () => {
      const ctx = new ComponentContextNext(TestComponent);
      ctx.run(() => {
        expect(ctx.fixture.componentInstance).toBeInstanceOf(TestComponent);
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
        expect(ctx.fixture.componentInstance).toBeInstanceOf(TestComponent);
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
      ctx.run({ input: { name: 'Default Guy' } }, () => {
        expect(ctx.fixture.nativeElement.textContent).toContain('Default Guy');
      });
    });
  });

  describe('.runChangeDetection()', () => {
    it('gets change detection working inside the fixture', () => {
      const ctx = new ComponentContextNext(TestComponent);
      ctx.run(() => {
        ctx.fixture.componentInstance.name = 'Changed Guy';
        ctx.tick();
        expect(ctx.fixture.nativeElement.textContent).toContain('Changed Guy');
      });
    });
  });

  describe('.cleanUp()', () => {
    it('destroys the fixture', () => {
      const ctx = new ComponentContextNext(TestComponent);
      ctx.run(noop);
      ctx.fixture.componentInstance.name = 'Changed Guy';
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
});

describe('ComponentContextNext class-level doc example', () => {
  @Component({ template: 'Hello, {{name}}!' })
  class GreeterComponent {
    @Input() name!: string;
  }

  let ctx: ComponentContextNext;
  beforeEach(() => {
    ctx = new ComponentContextNext(GreeterComponent);
  });

  it('greets you by name', () => {
    ctx.run({ input: { name: 'World' } }, () => {
      expect(ctx.fixture.nativeElement.textContent).toBe('Hello, World!');
    });
  });
});
