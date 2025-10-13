import {
  ChangeDetectionStrategy,
  Component,
  inject,
  InjectionToken,
  Input,
  OnChanges,
  OnInit,
  Pipe,
  PipeTransform,
  SimpleChanges,
} from '@angular/core';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { isDefined, isFalsy } from '@s-libs/js-core';
import {
  AngularContext,
  ComponentContext,
  expectSingleCallAndReset,
} from '@s-libs/ng-dev';
import { BehaviorSubject, combineLatest, noop } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { click, find, findButton } from '../test-helpers';
import { DirectiveSuperclass } from './directive-superclass';

/* eslint-disable @angular-eslint/prefer-signals -- this class's purpose is pre-signals */
/* eslint-disable @typescript-eslint/no-deprecated -- the class we are testing is deprecated */

const colorToken = new InjectionToken('color$', {
  factory: (): BehaviorSubject<string> => new BehaviorSubject('Grey'),
});

@Component({
  selector: 'sl-color-text',
  template: ` <span [style.background]="color">{{ color }}</span> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ColorTextComponent extends DirectiveSuperclass {
  @Input() prefix?: string;
  @Input() prefix2?: string;
  color!: string;

  constructor() {
    super();
    this.bindToInstance(
      'color',
      combineLatest([
        this.getInput$('prefix'),
        this.getInput$('prefix2'),
        inject(colorToken),
      ]).pipe(map((parts) => parts.filter((p) => p).join(''))),
    );
  }
}

@Component({
  imports: [ColorTextComponent],
  template: `
    <button (click)="toggle('prefix', 'Dark')">Dark</button>
    <button (click)="toggle('prefix2', 'Slate')">Slate</button>
    <button (click)="toggle('prefix', 'Dark'); toggle('prefix2', 'Slate')">
      Both
    </button>
    <button (click)="hide = !hide">Hide</button>
    @if (!hide) {
      <sl-color-text [prefix]="prefix" [prefix2]="prefix2" />
    }
  `,
})
class TestComponent {
  color$ = new BehaviorSubject('Green');
  prefix?: string;
  prefix2?: string;
  hide = false;

  toggle(key: 'prefix' | 'prefix2', value: string): void {
    this[key] = isDefined(this[key]) ? undefined : value;
  }
}

class TestComponentContext extends ComponentContext<TestComponent> {
  constructor() {
    super(TestComponent, {
      providers: [
        // this can go away with component harnesses eventually
        { provide: ComponentFixtureAutoDetect, useValue: true },
      ],
    });
  }
}

describe('DirectiveSuperclass', () => {
  function colorTextComponent(ctx: TestComponentContext): ColorTextComponent {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return ctx.fixture.debugElement.query(By.directive(ColorTextComponent))
      .componentInstance;
  }

  function darkButton(ctx: TestComponentContext): HTMLButtonElement {
    return findButton(ctx.fixture, 'Dark');
  }

  function slateButton(ctx: TestComponentContext): HTMLButtonElement {
    return findButton(ctx.fixture, 'Slate');
  }

  function bothButton(ctx: TestComponentContext): HTMLButtonElement {
    return findButton(ctx.fixture, 'Both');
  }

  function hideButton(ctx: TestComponentContext): HTMLButtonElement {
    return findButton(ctx.fixture, 'Hide');
  }

  function colorSpan(ctx: TestComponentContext): HTMLSpanElement {
    return find<HTMLSpanElement>(ctx.fixture, 'sl-color-text span');
  }

  it('can be used as the superclass to a pipe (production bug)', () => {
    @Pipe({ name: 'not', })
    class NotPipe extends DirectiveSuperclass implements PipeTransform {
      transform(value: any): boolean {
        return isFalsy(value);
      }
    }
    expect(() => {
      new AngularContext({ declarations: [NotPipe] }).run(noop);
    }).not.toThrowError();
  });

  describe('.inputChanges$', () => {
    it('emits the keys that change', () => {
      const ctx = new TestComponentContext();
      ctx.run(() => {
        const stub = jasmine.createSpy();
        colorTextComponent(ctx).inputChanges$.subscribe(stub);
        expect(stub).not.toHaveBeenCalled();

        click(darkButton(ctx));
        expectSingleCallAndReset(stub, new Set(['prefix']));

        click(slateButton(ctx));
        expectSingleCallAndReset(stub, new Set(['prefix2']));

        click(bothButton(ctx));
        expectSingleCallAndReset(stub, new Set(['prefix', 'prefix2']));
      });
    });
  });

  describe('.getInput$()', () => {
    it('emits the value of an input when it changes', () => {
      const ctx = new TestComponentContext();
      ctx.run(() => {
        const stub = jasmine.createSpy();
        colorTextComponent(ctx).getInput$('prefix2').subscribe(stub);
        ctx.tick();
        expect(stub).toHaveBeenCalledTimes(1);
        expect(stub.calls.argsFor(0)).toEqual([undefined]);

        click(darkButton(ctx));
        expect(stub).toHaveBeenCalledTimes(1);

        click(slateButton(ctx));
        expect(stub).toHaveBeenCalledTimes(2);
        expect(stub.calls.argsFor(1)).toEqual(['Slate']);

        click(bothButton(ctx));
        expect(stub).toHaveBeenCalledTimes(3);
        expect(stub.calls.argsFor(2)).toEqual([undefined]);
      });
    });

    // https://github.com/simontonsoftware/s-ng-utils/issues/10
    it('emits `undefined` for unspecified inputs', () => {
      @Component({  })
      class InputTrackingComponent extends DirectiveSuperclass {
        @Input() unspecified?: string;
        @Input() specified?: string;
        emittedValue? = 'initial value';

        constructor() {
          super();
          this.getInput$('unspecified').subscribe((value) => {
            this.emittedValue = value;
          });
        }
      }

      const ctx2 = new ComponentContext(InputTrackingComponent);
      ctx2.assignInputs({ specified: 'a value' });
      ctx2.run(() => {
        const testDirective = ctx2.getComponentInstance();
        expect(testDirective.emittedValue).toBe(undefined);
      });
    });

    // https://github.com/simontonsoftware/s-libs/issues/14
    it('does not emit until ngOnChanges is called', () => {
      @Component({  })
      class StageTrackingComponent
        extends DirectiveSuperclass
        implements OnChanges
      {
        @Input() myInput?: string;
        stage = 'before ngOnChanges';
        emittedDuring?: string;

        constructor() {
          super();
          this.getInput$('myInput')
            .pipe(take(1))
            .subscribe(() => {
              this.emittedDuring = this.stage;
            });
        }

        override ngOnChanges(changes: SimpleChanges): void {
          this.stage = 'after ngOnChanges';
          super.ngOnChanges(changes);
        }
      }

      const ctx2 = new ComponentContext(StageTrackingComponent);
      ctx2.run(() => {
        const testDirective = ctx2.getComponentInstance();
        expect(testDirective.emittedDuring).toBe('after ngOnChanges');
      });
    });

    it('emits even if no inputs are provided to the component', () => {
      @Component({ })
      class NoInputComponent extends DirectiveSuperclass {
        @Input() myInput?: string;
        emitted = false;

        constructor() {
          super();
          this.getInput$('myInput').subscribe(() => {
            this.emitted = true;
          });
        }
      }

      const ctx2 = new ComponentContext(NoInputComponent, {}, ['myInput']);
      ctx2.run(() => {
        const testDirective = ctx2.fixture.debugElement
          .query(By.directive(NoInputComponent))
          .injector.get(NoInputComponent);
        expect(testDirective.emitted).toBe(true);
      });
    });

    it('emits immediately if ngOnChanges was already called (prerelease bug)', () => {
      @Component({  template: `{{ boundValue.name }}` })
      class InputBindingComponent
        extends DirectiveSuperclass
        implements OnInit
      {
        @Input() inputValue!: { name: string };
        boundValue!: { name: string };

        constructor() {
          super();
          this.getInput$('inputValue').subscribe();
        }

        ngOnInit(): void {
          this.bindToInstance('boundValue', this.getInput$('inputValue'));
        }
      }

      const ctx2 = new ComponentContext(InputBindingComponent);
      ctx2.assignInputs({ inputValue: { name: 'Techgeek19' } });
      ctx2.run(() => {
        expect(ctx2.fixture.nativeElement.textContent).toContain('Techgeek19');
      });
    });

    it('emits immediately during the first call to ngOnChanges (prerelease bug) 2', () => {
      @Component({ template: `{{ boundValue.name }}` })
      class InputBindingComponent extends DirectiveSuperclass {
        @Input() inputValue!: { name: string };
        boundValue!: { name: string };

        constructor() {
          super();
          this.bindToInstance('boundValue', this.getInput$('inputValue'));
        }
      }

      const ctx2 = new ComponentContext(InputBindingComponent);
      ctx2.assignInputs({ inputValue: { name: 'Techgeek19' } });
      ctx2.run(() => {
        expect(ctx2.fixture.nativeElement.textContent).toContain('Techgeek19');
      });
    });
  });

  describe('.bindToInstance()', () => {
    it('sets the local value', () => {
      const ctx = new TestComponentContext();
      ctx.run(() => {
        expect(colorSpan(ctx).innerText).toBe('Grey');
        expect(colorSpan(ctx).style.backgroundColor).toBe('grey');

        click(darkButton(ctx));
        expect(colorSpan(ctx).innerText).toBe('DarkGrey');
        expect(colorSpan(ctx).style.backgroundColor).toBe('darkgrey');

        click(slateButton(ctx));
        expect(colorSpan(ctx).innerText).toBe('DarkSlateGrey');
        expect(colorSpan(ctx).style.backgroundColor).toBe('darkslategrey');

        click(bothButton(ctx));
        expect(colorSpan(ctx).innerText).toBe('Grey');
        expect(colorSpan(ctx).style.backgroundColor).toBe('grey');
      });
    });

    it('triggers change detection', () => {
      const ctx = new TestComponentContext();
      ctx.run(() => {
        ctx.inject(colorToken).next('Blue');
        ctx.fixture.detectChanges();
        expect(colorSpan(ctx).innerText).toBe('Blue');
        expect(colorSpan(ctx).style.backgroundColor).toBe('blue');

        click(bothButton(ctx));
        expect(colorSpan(ctx).innerText).toBe('DarkSlateBlue');
        expect(colorSpan(ctx).style.backgroundColor).toBe('darkslateblue');
      });
    });
  });

  describe('.subscribeTo()', () => {
    it('cleans up subscriptions', () => {
      const ctx = new TestComponentContext();
      ctx.run(() => {
        const color$ = ctx.inject(colorToken);
        expect(color$.observed).toBe(true);

        click(hideButton(ctx));
        expect(color$.observed).toBe(false);
      });
    });
  });
});
