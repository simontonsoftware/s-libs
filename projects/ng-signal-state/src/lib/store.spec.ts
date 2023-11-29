import { ChangeDetectionStrategy, Component } from '@angular/core';
import { cloneDeep, identity, pick } from '@s-libs/micro-dash';
import { ComponentContext, staticTest } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { InnerState, TestState } from '../test-helpers/test-state';
import { RootStore, Store } from './index';

describe('Store', () => {
  let store: RootStore<TestState>;

  beforeEach(() => {
    store = new RootStore(new TestState());
  });

  describe('()', () => {
    it('caches values', () => {
      expect(store('counter')).toBe(store('counter'));
    });
  });

  describe('.state()', () => {
    it('works when there are no subscribers', () => {
      expect(store('nested').state().state).toBe(0);
      expect(store('nested')('state').state()).toBe(0);

      store('nested')('state').set(1);
      expect(store('nested').state().state).toBe(1);
      expect(store('nested')('state').state()).toBe(1);
    });

    it('integrates with change detection & such', () => {
      @Component({
        selector: 'sl-inner',
        standalone: true,
        template: `{{ store('counter').state() }}`,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class InnerComponent {
        store = store;
      }

      @Component({
        standalone: true,
        template: `<sl-inner />`,
        imports: [InnerComponent],
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class TestComponent {}

      const ctx = new ComponentContext(TestComponent);
      ctx.run(async () => {
        expect(ctx.fixture.nativeElement.textContent).toBe('0');
        store('counter').set(1);
        ctx.tick();
        expect(ctx.fixture.nativeElement.textContent).toBe('1');
      });
    });
  });

  describe('.assign()', () => {
    it('assigns the exact objects given', () => {
      const before = store.state().nested;
      const left = new InnerState();
      const right = new InnerState();
      store('nested').assign({ left, right });
      const after = store.state().nested;

      expect(before).not.toBe(after);
      expect(before.left).toBeUndefined();
      expect(before.right).toBeUndefined();
      expect(after.left).toBe(left);
      expect(after.right).toBe(right);
    });

    it('does nothing when setting to the same value', () => {
      const startingState = store.state();
      const stateClone = cloneDeep(startingState);

      store.assign(pick(startingState, 'counter', 'nested'));
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);

      store.assign({});
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);

      store('nested').assign(startingState.nested);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);
    });

    it('throws with a useful message when the state is missing', () => {
      expect(() => {
        store<'optional', InnerState>('optional').assign({ state: 3 });
      }).toThrowError('cannot assign to undefined state');
    });
  });

  describe('.setUsing()', () => {
    it('set the state to the exact object returned', () => {
      const object = new InnerState();
      store('optional').setUsing(() => object);
      expect(store.state().optional).toBe(object);
    });

    it('uses the passed-in arguments', () => {
      store('nested').setUsing(() => new InnerState(1));
      expect(store.state().nested.state).toBe(1);

      store('nested').setUsing(
        (_state, left, right) => {
          const newState = new InnerState(2);
          newState.left = left;
          newState.right = right;
          return newState;
        },
        new InnerState(3),
        new InnerState(4),
      );
      expect(store.state().nested.state).toBe(2);
      expect(store.state().nested.left!.state).toBe(3);
      expect(store.state().nested.right!.state).toBe(4);
    });

    it('is OK having `undefined` returned', () => {
      store('optional').set(new InnerState());

      expect(store.state().optional).not.toBe(undefined);
      store('optional').setUsing(() => undefined);
      expect(store.state().optional).toBe(undefined);
    });

    it('is OK having the same object returned', () => {
      const origState = store.state();
      store.setUsing(identity);
      expect(store.state()).toBe(origState);
    });

    it('throws with a useful message when the state is missing', () => {
      expect(() => {
        store<'optional', InnerState>('optional')('state').setUsing(() => 3);
      }).toThrowError('cannot modify when parent state is missing');
    });

    it('does nothing when setting to the same value', () => {
      const startingState = store.state();
      const stateClone = cloneDeep(startingState);

      store.setUsing(identity);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);

      store('counter').setUsing(identity);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);

      store('nested').setUsing(identity);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);
    });
  });

  describe('.mutateUsing()', () => {
    it('uses the passed-in arguments', () => {
      store('array').set([]);

      store('array').mutateUsing((array) => {
        array!.push(1);
      });
      expect(store.state().array).toEqual([1]);

      store('array').mutateUsing(
        (array, a, b) => {
          array!.push(a, b);
        },
        2,
        3,
      );
      expect(store.state().array).toEqual([1, 2, 3]);
    });

    it('works when the state is undefined', () => {
      store('optional').mutateUsing((value) => {
        expect(value).toBe(undefined);
      });
    });
  });

  it('has fancy typing', () => {
    staticTest(() => {
      class State {
        a!: number;
        b!: string;
        obj!: { c: Date };
        ary!: boolean[];
      }

      const str = new RootStore<State>(new State());

      expectTypeOf(str('a')).toEqualTypeOf<Store<number>>();
      expectTypeOf(str('obj')).toEqualTypeOf<Store<{ c: Date }>>();
      expectTypeOf(str('obj')('c')).toEqualTypeOf<Store<Date>>();
      expectTypeOf(str('ary')).toEqualTypeOf<Store<boolean[]>>();
      expectTypeOf(str('ary')(1)).toEqualTypeOf<Store<boolean>>();
    });
  });
});
