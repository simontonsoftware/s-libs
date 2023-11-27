import { cloneDeep, identity, pick } from '@s-libs/micro-dash';
import { expectSingleCallAndReset } from '@s-libs/ng-dev';
import { expectTypeOf } from 'expect-type';
import { skip, take } from 'rxjs/operators';
import { InnerState, TestState } from '../test-helpers/test-state';
import { RootStore, Store } from './index';

describe('Store', () => {
  let store: RootStore<TestState>;

  beforeEach(() => {
    store = new RootStore(new TestState());
  });

  describe('.$', () => {
    it('fires immediately, and with every change', () => {
      const rootNext = jasmine.createSpy();
      const counterNext = jasmine.createSpy();
      const nestedNext = jasmine.createSpy();
      store.$.subscribe(rootNext);
      store('counter').$.subscribe(counterNext);
      store('nested').$.subscribe(nestedNext);
      expect(rootNext).toHaveBeenCalledTimes(1);
      expect(counterNext).toHaveBeenCalledTimes(1);
      expect(nestedNext).toHaveBeenCalledTimes(1);

      store('counter').set(5);
      expect(rootNext).toHaveBeenCalledTimes(2);
      expect(counterNext).toHaveBeenCalledTimes(2);

      store('nested')('state').set(15);
      expect(rootNext).toHaveBeenCalledTimes(3);
      expect(nestedNext).toHaveBeenCalledTimes(2);
    });

    it('gives the new value', () => {
      let lastValue: InnerState;
      store('nested').$.subscribe((value) => {
        lastValue = value;
      });
      expect(lastValue!).toBe(store.state().nested);
      expect(lastValue!).toEqual(new InnerState());

      const newValue = new InnerState(4);
      store('nested').set(newValue);
      expect(lastValue!).toBe(newValue);
      expect(lastValue!).toEqual(new InnerState(4));
    });

    it('gives undefined when a parent object is deleted', () => {
      const next = jasmine.createSpy();

      store<'optional', InnerState>('optional')('state').$.subscribe(next);
      expectSingleCallAndReset(next, undefined);

      store('optional').set(new InnerState(17));
      expectSingleCallAndReset(next, 17);

      store('optional').delete();
      expectSingleCallAndReset(next, undefined);
    });

    it('does not fire when parent objects change', () => {
      const counterNext = jasmine.createSpy();
      const optionalNext = jasmine.createSpy();
      store('counter').$.subscribe(counterNext);
      store<'optional', InnerState>('optional')('state').$.subscribe(
        optionalNext,
      );
      expect(counterNext).toHaveBeenCalledTimes(1);
      expect(optionalNext).toHaveBeenCalledTimes(1);

      store.delete();
      expect(counterNext).toHaveBeenCalledTimes(2);
      expect(optionalNext).toHaveBeenCalledTimes(1);

      store.set(new TestState());
      expect(counterNext).toHaveBeenCalledTimes(3);
      expect(optionalNext).toHaveBeenCalledTimes(1);

      store.set(new TestState());
      expect(counterNext).toHaveBeenCalledTimes(3);
      expect(optionalNext).toHaveBeenCalledTimes(1);

      store('optional').set(new InnerState());
      expect(counterNext).toHaveBeenCalledTimes(3);
      expect(optionalNext).toHaveBeenCalledTimes(2);
    });

    // This is important for use in angular templates, so each change detection cycle it gets the same object, so OnPush can work
    it('returns the same observable on successive calls', () => {
      const observable = store.$;
      expect(store.$).toBe(observable);

      store('counter').set(2);
      expect(store.$).toBe(observable);
    });

    it('works when a different path was previously subscribed', () => {
      const nested = new InnerState();
      nested.left = new InnerState();
      nested.right = new InnerState();
      store('nested').set(nested);

      const spy = jasmine.createSpy();
      store('nested')('left').$.subscribe(spy).unsubscribe();
      expectSingleCallAndReset(spy, nested.left);

      store('nested')('right').$.subscribe(spy).unsubscribe();
      expectSingleCallAndReset(spy, nested.right);
    });

    it('works when 2 child stores manage to get created for the same state (code coverage)', () => {
      const spy = jasmine.createSpy();

      const obs = store('counter').$;
      const sub = store('counter').$.subscribe();
      obs.subscribe(spy);
      expectSingleCallAndReset(spy, 0);

      sub.unsubscribe();
      store('counter').set(2);
      expectSingleCallAndReset(spy, 2);
    });

    // https://github.com/simontonsoftware/ng-app-state/issues/13
    it('does not emit stale values in the middle of propagating a change (production bug)', () => {
      let log: jasmine.Spy | undefined;
      store.$.subscribe(() => {
        store('optional').$.subscribe(log);
      });
      store('optional').$.subscribe();

      log = jasmine.createSpy();
      const value = new InnerState();
      store('optional').set(value);

      expectSingleCallAndReset(log, value);
    });

    // https://github.com/simontonsoftware/ng-app-state/issues/20
    it('will work again after being unsubscribed from (production bug)', () => {
      const counterStore = store('counter');
      counterStore.$.subscribe().unsubscribe();
      counterStore.set(3);
      const spy = jasmine.createSpy();
      counterStore.$.subscribe(spy);
      expectSingleCallAndReset(spy, 3);
    });

    it('works when the number of subscribers changes mid-emit (production bug)', () => {
      const spy = jasmine.createSpy();

      store('counter').$.pipe(take(2)).subscribe();
      store('counter').$.subscribe(spy);
      expectSingleCallAndReset(spy, 0);

      store('counter').set(1);
      expectSingleCallAndReset(spy, 1);
    });

    it('works when the last subscriber to a child store unsubscribes mid-emit (production bug)', () => {
      store('counter')
        .$.pipe(skip(1))
        .subscribe(() => {
          sub2.unsubscribe();
        });
      const sub2 = store('nested').$.subscribe();

      expect(() => {
        store('counter').set(1);
      }).not.toThrowError();
    });
  });

  describe('()', () => {
    it('caches values (only) if they are active', () => {
      const counter = store('counter');
      expect(store('counter')).not.toBe(counter);
      const counterSub1 = counter.$.subscribe();
      expect(store('counter')).toBe(counter);
      counterSub1.unsubscribe();
      expect(store('counter')).not.toBe(counter);

      const nested = store('nested');
      expect(store('nested')).not.toBe(nested);
      const leftSub = nested('left').$.subscribe();
      const rightSub = nested('right').$.subscribe();
      expect(store('nested')).toBe(nested);
      leftSub.unsubscribe();
      expect(store('nested')).toBe(nested);
      rightSub.unsubscribe();
      expect(store('nested')).not.toBe(nested);
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
      store.$.pipe(skip(1)).subscribe(() => {
        fail('should not have fired');
      });

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
      store.$.pipe(skip(1)).subscribe(() => {
        fail('should not have fired');
      });

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

  describe('.getRootStore()', () => {
    it('returns a reference to the root store', () => {
      expect(store.getRootStore()).toBe(store);
      expect(store('nested')('state').getRootStore()).toBe(store);
    });
  });

  describe('help for subclasses', () => {
    it('does nothing when trying to update to the same value', () => {
      const startingState = store.state();
      const stateClone = cloneDeep(startingState);
      store.$.pipe(skip(1)).subscribe(() => {
        fail('should not have fired');
      });

      store.set(startingState);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);

      store('counter').set(startingState.counter);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);

      store('nested').set(startingState.nested);
      expect(store.state()).toBe(startingState);
      expect(cloneDeep(store.state())).toEqual(stateClone);
    });
  });

  it('has fancy typing', () => {
    expect().nothing();

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

    expectTypeOf(str.getRootStore()).toEqualTypeOf<RootStore<object>>();
    expectTypeOf(str('obj')('c').getRootStore()).toEqualTypeOf<
      RootStore<object>
    >();
  });
});
