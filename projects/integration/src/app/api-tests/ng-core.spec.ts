import {
  DirectiveSuperclass,
  FormControlSuperclass,
  InjectableSuperclass,
  provideValueAccessor,
  WrappedFormControlSuperclass,
} from 'ng-core';

describe('ng-core', () => {
  it('has DirectiveSuperclass', () => {
    expect(DirectiveSuperclass).toBeDefined();
  });

  it('has FormControlSuperclass', () => {
    expect(FormControlSuperclass).toBeDefined();
  });

  it('has InjectableSuperclass', () => {
    expect(InjectableSuperclass).toBeDefined();
  });

  it('has WrappedFormControlSuperclass', () => {
    expect(WrappedFormControlSuperclass).toBeDefined();
  });

  it('has provideValueAccessor', () => {
    expect(provideValueAccessor).toBeDefined();
  });
});
