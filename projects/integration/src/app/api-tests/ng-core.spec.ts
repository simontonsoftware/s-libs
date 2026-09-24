import {
  debounceWhileHandling,
  FormComponentSuperclass,
  InjectableSuperclass,
  LazyLoader,
  mixInInjectableSuperclass,
  provideEagerLoading,
  providePersistence,
  provideValueAccessor,
  WrappedControlSuperclass,
  type PersistenceCodec,
  type PersistenceConfig,
} from '@s-libs/ng-core';
import { staticTest } from '@s-libs/ng-vitest';
import { expectTypeOf } from 'expect-type';

describe('ng-core', () => {
  it('has FormComponentSuperclass', () => {
    expect(FormComponentSuperclass).toBeDefined();
  });

  it('has LazyLoader', () => {
    expect(LazyLoader).toBeDefined();
  });

  it('has InjectableSuperclass', () => {
    expect(InjectableSuperclass).toBeDefined();
  });

  it('has PersistenceCodec', () => {
    staticTest(() => {
      expectTypeOf<PersistenceCodec<any, any>>();
    });
  });

  it('has PersistenceConfig', () => {
    staticTest(() => {
      expectTypeOf<PersistenceConfig<any, any>>();
    });
  });

  it('has WrappedControlSuperclass', () => {
    expect(WrappedControlSuperclass).toBeDefined();
  });

  it('has debounceWhileHandling', () => {
    expect(debounceWhileHandling).toBeDefined();
  });

  it('has mixInInjectableSuperclass', () => {
    expect(mixInInjectableSuperclass).toBeDefined();
  });

  it('has provideEagerLoading', () => {
    expect(provideEagerLoading).toBeDefined();
  });

  it('has providePersistence', () => {
    expect(providePersistence).toBeDefined();
  });

  it('has provideValueAccessor', () => {
    expect(provideValueAccessor).toBeDefined();
  });
});
