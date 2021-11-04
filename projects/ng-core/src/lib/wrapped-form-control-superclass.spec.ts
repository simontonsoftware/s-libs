import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentContext } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { WrappedFormControlSuperclass } from './wrapped-form-control-superclass';

describe('WrappedFormControlSuperclass', () => {
  it('provides a FormControl', () => {
    @Component({ template: `<input [formControl]="control" />` })
    class SimpleControl extends WrappedFormControlSuperclass<string> {}

    const ctx = new ComponentContext(SimpleControl, {
      imports: [ReactiveFormsModule],
    });
    ctx.run(async () => {
      const control = ctx.getComponentInstance().control;
      expect(control).toEqual(jasmine.any(FormControl));
      expectTypeOf(control).toMatchTypeOf<FormControl>();
    });
  });
});
