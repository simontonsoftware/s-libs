import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentContext } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { WrappedFormControlSuperclass } from './wrapped-form-control-superclass';

describe('WrappedFormControlSuperclass', () => {
  it('provides a FormControl', () => {
    @Component({ template: `` })
    class SimpleControlComponent extends WrappedFormControlSuperclass<string> {}

    const ctx = new ComponentContext(SimpleControlComponent, {
      imports: [ReactiveFormsModule],
    });
    ctx.run(async () => {
      const { control } = ctx.getComponentInstance();
      expect(control).toEqual(jasmine.any(FormControl));
      expectTypeOf(control).toEqualTypeOf<FormControl>();
    });
  });
});
