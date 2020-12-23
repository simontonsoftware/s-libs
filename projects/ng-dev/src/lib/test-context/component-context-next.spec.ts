import {
  Component,
  ElementRef,
  InjectionToken,
  Input,
  NgModule,
  OnChanges,
  SimpleChanges,
  ViewChild,
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

  @Component({ selector: 's-test', template: 'Hello, {{name}}!' })
  class TestComponent {
    @Input() name!: string;
  }

  @Component({ selector: 's-change-detecting', template: '' })
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

    it('requires a tag selector on the component', () => {
      @Component({ template: '' })
      class NoSelectorComponent {}
      expect(() => {
        // tslint:disable-next-line:no-unused-expression
        new ComponentContextNext(NoSelectorComponent);
      }).toThrowError('Component must have a selector that matches a tag name');

      // tslint:disable-next-line:component-selector
      @Component({ selector: '[myAttribute]', template: '' })
      class AttributeSelectorComponent {}
      expect(() => {
        // tslint:disable-next-line:no-unused-expression
        new ComponentContextNext(AttributeSelectorComponent);
      }).toThrowError('Component must have a selector that matches a tag name');

      @Component({
        // tslint:disable-next-line:component-selector
        selector: 'tagName.withClass[andAttr="value"]',
        template: '',
      })
      class FancySelectorComponent {}
      expect(() => {
        // tslint:disable-next-line:no-unused-expression
        new ComponentContextNext(FancySelectorComponent);
      }).toThrowError('Component must have a selector that matches a tag name');
    });

    it('picks up inputs that are setters', () => {
      @Component({ selector: 's-setter-input', template: '' })
      class SetterInputComponent {
        receivedValue?: string;

        @Input() set setterInput(value: string) {
          this.receivedValue = value;
        }
      }

      const ctx = new ComponentContextNext(SetterInputComponent);
      ctx.run({ inputs: { setterInput: 'sent value' } }, () => {
        expect(ctx.getComponentInstance().receivedValue).toBe('sent value');
      });
    });

    it("can handle components that don't have inputs", () => {
      @Component({ selector: 's-no-input', template: '' })
      class NoInputComponent {}

      expect(() => {
        new ComponentContextNext(NoInputComponent).run(noop);
      }).not.toThrowError();
    });

    it('can handle components that use ViewChild in tricky ways', () => {
      @Component({ selector: 's-tricky-view-child', template: '' })
      class TrickyViewChildComponent {
        @Input() tricky?: string;
        @ViewChild('tricky') trickyChild!: ElementRef;
      }
      const ctx = new ComponentContextNext(TrickyViewChildComponent);
      ctx.run({ inputs: { tricky: 'the value' } }, () => {
        expect(ctx.getComponentInstance().tricky).toBe('the value');
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

    it('can update renamed inputs', () => {
      @Component({
        selector: 's-renamed-input',
        template: '{{ propertyName }}',
      })
      class RenamedInputComponent {
        // tslint:disable-next-line:no-input-rename
        @Input('bindingName') propertyName?: string;
      }

      const ctx = new ComponentContextNext(RenamedInputComponent);
      ctx.run({ inputs: { propertyName: 'custom value' } }, () => {
        expect(ctx.fixture.nativeElement.textContent).toContain('custom value');
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
});

// describe('ComponentContextNext class-level doc example', () => {
//   @Component({ template: 'Hello, {{name}}!' })
//   class GreeterComponent {
//     @Input() name!: string;
//   }
//
//   let ctx: ComponentContextNext;
//   beforeEach(() => {
//     ctx = new ComponentContextNext(GreeterComponent);
//   });
//
//   it('greets you by name', () => {
//     ctx.run({ input: { name: 'World' } }, () => {
//       expect(ctx.fixture.nativeElement.textContent).toBe('Hello, World!');
//     });
//   });
// });
