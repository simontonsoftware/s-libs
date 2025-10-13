import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ComponentContext } from '@s-libs/ng-dev';
import { click, find, findButton } from '../../test-helpers';
import { DirectiveSuperclass } from '../directive-superclass';
import { InjectableSuperclass } from '../injectable-superclass';
import { FormComponentSuperclass } from './form-component-superclass';
import { provideValueAccessor } from './provide-value-accessor';

@Component({
  selector: `sl-counter`,
  template: `
    <button [disabled]="isDisabled" (click)="increment()">{{ counter }}</button>
  `,
  providers: [provideValueAccessor(CounterComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CounterComponent extends FormComponentSuperclass<number> {
  counter = 0;

  handleIncomingValue(value: number): void {
    this.counter = value;
  }

  increment(): void {
    this.emitOutgoingValue(++this.counter);
    this.onTouched();
  }
}

@Component({
  imports: [CounterComponent, FormsModule],
  template: `
    <sl-counter
      #counter="ngModel"
      [disabled]="shouldDisable()"
      [(ngModel)]="value"
    />
    @if (counter.touched) {
      Touched!
    }
    <button (click)="shouldDisable.set(!shouldDisable)">Toggle Disabled</button>
  `,
})
class TestComponent {
  readonly value = model(0);
  readonly shouldDisable = model(false);
}

describe('FormComponentSuperclass', () => {
  let ctx: ComponentContext<TestComponent>;
  beforeEach(() => {
    ctx = new ComponentContext(TestComponent, {
      // this can go away with component harnesses eventually
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }],
    });
  });

  function incrementButton(): HTMLButtonElement {
    return find<HTMLButtonElement>(ctx.fixture, 'sl-counter button');
  }

  function toggleDisabledButton(): HTMLButtonElement {
    return findButton(ctx.fixture, 'Toggle Disabled');
  }

  it('provides help for 2-way binding', () => {
    ctx.assignInputs({ value: 15 });
    ctx.run(() => {
      expect(ctx.getComponentInstance().value()).toBe(15);
      expect(ctx.fixture.nativeElement.innerText).toContain('15');

      click(incrementButton());
      expect(ctx.getComponentInstance().value()).toBe(16);
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
    ctx.assignInputs({ shouldDisable: true });
    ctx.run(() => {
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
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      expect(counter instanceof DirectiveSuperclass).toBe(true);
    });
  });
});
