import {
  DirectiveSuperclass,
  FormComponentSuperclass,
  InjectableSuperclass,
  LazyLoader,
  mixInInjectableSuperclass,
  provideEagerLoading,
  provideValueAccessor,
  WrappedControlSuperclass,
} from '@s-libs/ng-core';

describe('ng-core', () => {
  it('has DirectiveSuperclass', () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    expect(DirectiveSuperclass).toBeDefined();
  });

  it('has FormComponentSuperclass', () => {
    expect(FormComponentSuperclass).toBeDefined();
  });

  it('has LazyLoader', () => {
    expect(LazyLoader).toBeDefined();
  });

  it('has InjectableSuperclass', () => {
    expect(InjectableSuperclass).toBeDefined();
  });

  it('has WrappedControlSuperclass', () => {
    expect(WrappedControlSuperclass).toBeDefined();
  });

  it('has mixInInjectableSuperclass', () => {
    expect(mixInInjectableSuperclass).toBeDefined();
  });

  it('has provideEagerLoading', () => {
    expect(provideEagerLoading).toBeDefined();
  });

  it('has provideValueAccessor', () => {
    expect(provideValueAccessor).toBeDefined();
  });
});
