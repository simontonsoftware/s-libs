import {
  Component,
  Directive,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { noop } from '@s-libs/micro-dash';
import { ComponentContext } from './component-context';

describe('WrapperComponent', () => {
  it("uses the component's selector if it is a tag name", () => {
    @Component({ selector: 'sl-tag-name', standalone: true, template: '' })
    class TagNameComponent {}

    const ctx = new ComponentContext(TagNameComponent);
    ctx.run(() => {
      expect(
        ctx.fixture.debugElement.query(By.directive(TagNameComponent)).name,
      ).toBe('sl-tag-name');
    });
  });

  it("can handle components that don't have a selector", () => {
    @Component({ standalone: true, template: 'the template' })
    class NoSelectorComponent {}

    const ctx = new ComponentContext(NoSelectorComponent);
    ctx.run(() => {
      expect(ctx.fixture.nativeElement.textContent).toContain('the template');
    });
  });

  it('can handle components whose selectors are not tag names', () => {
    @Component({
      // eslint-disable-next-line @angular-eslint/component-selector
      selector: '[myAttribute]',
      standalone: true,
      template: 'the template',
    })
    class AttributeSelectorComponent {}
    const ctx = new ComponentContext(AttributeSelectorComponent);
    ctx.run(() => {
      expect(ctx.fixture.nativeElement.textContent).toContain('the template');
    });
  });

  it('can handle renamed inputs', () => {
    @Component({ standalone: true, template: '{{ propertyName }}' })
    class RenamedInputComponent {
      // eslint-disable-next-line @angular-eslint/no-input-rename
      @Input('bindingName') propertyName?: string;
    }

    const ctx = new ComponentContext(RenamedInputComponent);
    ctx.assignInputs({ propertyName: 'custom value' });
    ctx.run(() => {
      expect(ctx.fixture.nativeElement.textContent).toContain('custom value');
    });
  });

  it('can handle inputs that are setters', () => {
    @Component({ standalone: true, template: '' })
    class SetterInputComponent {
      receivedValue?: string;

      @Input() set setterInput(value: string) {
        this.receivedValue = value;
      }
    }

    const ctx = new ComponentContext(SetterInputComponent);
    ctx.assignInputs({ setterInput: 'sent value' });
    ctx.run(() => {
      expect(ctx.getComponentInstance().receivedValue).toBe('sent value');
    });
  });

  it("can handle components that don't have inputs", () => {
    @Component({ standalone: true, template: '' })
    class NoInputComponent {}

    expect(() => {
      new ComponentContext(NoInputComponent).run(noop);
    }).not.toThrowError();
  });

  it('can handle components that use non-Input annotations in tricky ways', () => {
    @Component({ standalone: true, template: '' })
    class TrickyViewChildComponent {
      @Input() tricky?: string;
      @ViewChild('tricky') trickyChild!: ElementRef;
    }
    const ctx = new ComponentContext(TrickyViewChildComponent);
    ctx.assignInputs({ tricky: 'the value' });
    ctx.run(() => {
      expect(ctx.getComponentInstance().tricky).toBe('the value');
    });
  });

  // https://github.com/simontonsoftware/s-libs/issues/40
  it('can handle inputs defined by a superclass (production bug)', () => {
    @Directive()
    class SuperclassComponent {
      @Input() superclassInput?: string;
    }

    @Component({ standalone: true, template: '' })
    class SubclassComponent extends SuperclassComponent {
      @Input() subclassInput?: string;
    }

    const ctx = new ComponentContext(SubclassComponent);
    ctx.assignInputs({ superclassInput: 'an actual value' });
    ctx.run(async () => {
      expect(ctx.getComponentInstance().superclassInput).toBe(
        'an actual value',
      );
    });
  });

  it('allows using default values for inputs', () => {
    @Component({ standalone: true, template: '' })
    class UnboundInputComponent {
      @Input() doNotBind = 'default value';
    }
    const ctx = new ComponentContext(UnboundInputComponent, {}, ['doNotBind']);
    ctx.run(() => {
      expect(ctx.getComponentInstance().doNotBind).toBe('default value');
    });
  });
});
