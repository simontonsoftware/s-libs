import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
} from '@angular/core';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ComponentContextNext } from '@s-libs/ng-dev';
import { click, find, findButton } from '../test-helpers';
import { DirectiveSuperclass } from './directive-superclass';
import {
  FormControlSuperclass,
  provideValueAccessor,
} from './form-control-superclass';
import { InjectableSuperclass } from './injectable-superclass';

@Component({
  template: `
    <s-counter-component
      [(ngModel)]="value"
      #counter="ngModel"
      [disabled]="shouldDisable"
    ></s-counter-component>
    <div *ngIf="counter.touched">Touched!</div>
    <button (click)="shouldDisable = !shouldDisable">Toggle Disabled</button>
  `,
})
class TestComponent {
  @Input() value = 0;
  @Input() shouldDisable = false;
}

@Component({
  selector: `s-counter-component`,
  template: `
    <button (click)="increment()" [disabled]="isDisabled">{{ counter }}</button>
  `,
  providers: [provideValueAccessor(CounterComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CounterComponent extends FormControlSuperclass<number> {
  counter = 0;

  constructor(injector: Injector) {
    super(injector);
  }

  handleIncomingValue(value: number): void {
    this.counter = value;
  }

  increment(): void {
    this.emitOutgoingValue(++this.counter);
    this.onTouched();
  }
}

describe('FormControlSuperclass', () => {
  let ctx: ComponentContextNext<TestComponent>;
  beforeEach(() => {
    ctx = new ComponentContextNext(TestComponent, {
      imports: [FormsModule],
      declarations: [CounterComponent],
      // this can go away with component harnesses eventually
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
    });
  });

  function incrementButton(): HTMLButtonElement {
    return find<HTMLButtonElement>(ctx.fixture, 's-counter-component button');
  }

  function toggleDisabledButton(): HTMLButtonElement {
    return findButton(ctx.fixture, 'Toggle Disabled');
  }

  ///////

  it('provides help for 2-way binding', () => {
    ctx.run({ inputs: { value: 15 } }, () => {
      expect(ctx.getComponentInstance().value).toBe(15);
      expect(ctx.fixture.nativeElement.innerText).toContain('15');

      click(incrementButton());
      expect(ctx.getComponentInstance().value).toBe(16);
      expect(ctx.fixture.nativeElement.innerText).toContain('16');
    });
  });

  it('provides help for `onTouched`', () => {
    ctx.run(() => {
      expect(ctx.fixture.nativeElement.innerText).not.toContain('Touched!');
      click(incrementButton());
      expect(ctx.fixture.nativeElement.innerText).toContain('Touched!');
    });
  });

  it('provides help for `[disabled]`', () => {
    ctx.run({ inputs: { shouldDisable: true } }, () => {
      expect(incrementButton().disabled).toBe(true);

      click(toggleDisabledButton());
      expect(incrementButton().disabled).toBe(false);
    });
  });

  it('has the right class hierarchy', () => {
    ctx.run(() => {
      const counter = ctx.fixture.debugElement.query(
        By.directive(CounterComponent),
      ).componentInstance;
      expect(counter instanceof InjectableSuperclass).toBe(true);
      expect(counter instanceof DirectiveSuperclass).toBe(true);
    });
  });
});
