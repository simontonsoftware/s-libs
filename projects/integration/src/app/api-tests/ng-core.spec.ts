import {
  DirectiveSuperclass,
  FormComponentSuperclass,
  InjectableSuperclass,
  mixInInjectableSuperclass,
  provideValueAccessor,
  WrappedControlSuperclass,
} from '@s-libs/ng-core';

describe('ng-core', () => {
  describe('public API', () => {
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

    it('has mixInInjectableSuperclass', () => {
      expect(mixInInjectableSuperclass).toBeDefined();
    });

    it('has provideValueAccessor', () => {
      expect(provideValueAccessor).toBeDefined();
    });
  });
});
