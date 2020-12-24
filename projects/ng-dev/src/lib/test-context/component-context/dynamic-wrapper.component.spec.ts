import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { noop } from '@s-libs/micro-dash';
import { ComponentContextNext } from './component-context-next';

describe('DynamicWrapperComponent', () => {
  it('uses the components selector if it is a tag name', () => {
    @Component({ selector: 's-tag-name', template: '' })
    class TagNameComponent {}

    const ctx = new ComponentContextNext(TagNameComponent);
    ctx.run(() => {
      expect(
        ctx.fixture.debugElement.query(By.directive(TagNameComponent)).name,
      ).toBe('s-tag-name');
    });
  });

  it("can handle components that don't have a selector", () => {
    @Component({ template: 'the template' })
    class NoSelectorComponent {}

    const ctx = new ComponentContextNext(NoSelectorComponent);
    ctx.run(() => {
      expect(ctx.fixture.nativeElement.textContent).toContain('the template');
    });
  });

  it('can handle components whose selectors are not tag names', () => {
    // tslint:disable-next-line:component-selector
    @Component({ selector: '[myAttribute]', template: 'the template' })
    class AttributeSelectorComponent {}
    const ctx = new ComponentContextNext(AttributeSelectorComponent);
    ctx.run(() => {
      expect(ctx.fixture.nativeElement.textContent).toContain('the template');
    });
  });

  it('can update renamed inputs', () => {
    @Component({ template: '{{ propertyName }}' })
    class RenamedInputComponent {
      // tslint:disable-next-line:no-input-rename
      @Input('bindingName') propertyName?: string;
    }

    const ctx = new ComponentContextNext(RenamedInputComponent);
    ctx.run({ inputs: { propertyName: 'custom value' } }, () => {
      expect(ctx.fixture.nativeElement.textContent).toContain('custom value');
    });
  });

  it('picks up inputs that are setters', () => {
    @Component({ template: '' })
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
    @Component({ template: '' })
    class NoInputComponent {}

    expect(() => {
      new ComponentContextNext(NoInputComponent).run(noop);
    }).not.toThrowError();
  });

  it('can handle components that use ViewChild in tricky ways', () => {
    @Component({ template: '' })
    class TrickyViewChildComponent {
      @Input() tricky?: string;
      @ViewChild('tricky') trickyChild!: ElementRef;
    }
    const ctx = new ComponentContextNext(TrickyViewChildComponent);
    ctx.run({ inputs: { tricky: 'the value' } }, () => {
      expect(ctx.getComponentInstance().tricky).toBe('the value');
    });
  });

  it('throws an error if given a non-input', () => {
    @Component({ template: '' })
    class NonInputComponent {
      // tslint:disable-next-line:no-input-rename
      @Input('nonInputBindingName') nonInput?: string;
    }

    const ctx = new ComponentContextNext(NonInputComponent);
    ctx.run(() => {
      expect(() => {
        ctx.updateInputs({ nonInput: 'value' });
      }).toThrowError('"nonInput" is not an input for this component');
    });
  });
});
