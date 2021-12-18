import {
  DirectiveSuperclass,
  FormComponentSuperclass,
  InjectableSuperclass,
  mixInInjectableSuperclass,
  provideValueAccessor,
  WrappedControlSuperclass,
  WrappedFormControlSuperclass,
} from '@s-libs/ng-core';

describe('ng-core', () => {
  it('has DirectiveSuperclass', () => {
    expect(DirectiveSuperclass).toBeDefined();
  });

  it('has FormComponentSuperclass', () => {
    expect(FormComponentSuperclass).toBeDefined();
  });

  it('has InjectableSuperclass', () => {
    expect(InjectableSuperclass).toBeDefined();
  });

  it('has WrappedControlSuperclass', () => {
    expect(WrappedControlSuperclass).toBeDefined();
  });

  it('has WrappedFormControlSuperclass', () => {
    expect(WrappedFormControlSuperclass).toBeDefined();
  });

  it('has mixInInjectableSuperclass', () => {
    expect(mixInInjectableSuperclass).toBeDefined();
  });

  it('has provideValueAccessor', () => {
    expect(provideValueAccessor).toBeDefined();
  });
});
