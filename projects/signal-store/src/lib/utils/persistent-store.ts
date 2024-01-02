import { effect } from '@angular/core';
import {
  MigrationManager,
  Persistence,
  VersionedObject,
} from '@s-libs/js-core';
import { identity } from '@s-libs/micro-dash';
import { RootStore } from '../root-store';

export interface PersistenceCodec<State, Persisted> {
  /**
   * Convert from the format that is kept in the store to what is persisted.
   */
  encode: (state: State) => Persisted;

  /**
   * Convert from the format that is persisted to what is kept in the store.
   */
  decode: (persisted: Persisted) => State;
}

/**
 * A store that is automatically saved to and restored from local storage. This is suitable for small stores that can very quickly be (de)serialized to/from JSON without any noticeable delay.
 *
 * ```ts
 * class MyState implements VersionedObject {
 *   _version = 1;
 *   // eslint-disable-next-line camelcase -- will fix in next version
 *   my_state_key = 'my default value';
 * }
 *
 * class MyStore extends PersistentStore<MyState> {
 *   constructor() {
 *     super('myPersistenceKey', new MyState());
 *   }
 * }
 *
 * let store = new MyStore();
 * store('my_state_key').state ='my persisted value';
 *
 * // the user leaves the page and comes back later ...
 * TestBed.flushEffects();
 *
 * store = new MyStore();
 * expect(store('my_state_key').state).toBe('my persisted value');
 * ```
 *
 * At this point, if you change `_version` the store will be reset to the default state. This is a convenience during initial development of your app. Once it is released to real users, you will want to use a {@link MigrationManager} to avoid wiping out your users' data:
 *
 * ```ts
 * class MyState implements VersionedObject {
 *   _version = 2; // bump version to 2
 *   myStateKey = 'my default value'; // schema change: my_state_key => myStateKey
 * }
 *
 * class MyMigrationManager extends MigrationManager<MyState> {
 *   constructor() {
 *     super();
 *     this.registerMigration(1, this.#migrateFromV1);
 *   }
 *
 *   #migrateFromV1(oldState: any): any {
 *     return { _version: 2, myStateKey: oldState.my_state_key };
 *   }
 * }
 *
 * class MyStore extends PersistentStore<MyState> {
 *   constructor() {
 *     // pass in our new `MyMigrationManager`
 *     super('myPersistenceKey', new MyState(), {
 *       migrator: new MyMigrationManager(),
 *     });
 *   }
 * }
 *
 * // the store gets the value persisted from version 1 in our previous example
 * const store = new MyStore();
 * expect(store('myStateKey').state).toBe('my persisted value');
 * ```
 *
 * If you want to persist something a little different from what is in the store, for example to omit some properties, use a {@linkcode PersistenceCodec}:
 *
 * ```ts
 * class MyState implements VersionedObject {
 *   _version = 1;
 *   sessionStart = Date.now();
 * }
 * type Persisted = Omit<MyState, 'sessionStart'>;
 *
 * class MyCodec implements PersistenceCodec<MyState, Persisted> {
 *   encode(left: MyState): Persisted {
 *     return omit(left, 'sessionStart');
 *   }
 *
 *   decode(right: Persisted): MyState {
 *     return { ...right, sessionStart: Date.now() };
 *   }
 * }
 *
 * class MyStore extends PersistentStore<MyState, Persisted> {
 *   constructor() {
 *     super('myPersistenceKey', new MyState(), { codec: new MyCodec() });
 *   }
 * }
 *
 * const session1Start = Date.now();
 * let store = new MyStore();
 * expect(store('sessionStart').state).toBe(session1Start);
 * expect(localStorage.getItem('myPersistenceKey')).toBe('{"_version":1}');
 *
 * // the user leaves the page and comes back later...
 *
 * tick(300_000); // 5 minutes pass
 * store = new MyStore();
 * expect(store('sessionStart').state).toBe(session1Start + 300_000);
 * ```
 */
export class PersistentStore<
  State extends VersionedObject,
  Persisted extends VersionedObject = State,
> extends RootStore<State> {
  /**
   * Must be instantiated in an injection context. This should naturally be the case for subclasses that are services (which is the common case).
   *
   * @param persistenceKey the key in local storage at which to persist the state
   * @param defaultState used when the state has not been persisted yet
   * @param __namedParameters.migrator used to update state that was at a lower {@link VersionedObject._version} when it was persisted
   * @param __namedParameters.codec used to persist a different format than what is kept in the store
   */
  constructor(
    persistenceKey: string,
    defaultState: State,
    {
      migrator = new NonMigrationManager() as MigrationManager<Persisted>,
      codec = new IdentityCodec<any>() as PersistenceCodec<State, Persisted>,
    } = {},
  ) {
    const persistence = new Persistence<Persisted>(persistenceKey);
    const defaultPersisted = codec.encode(defaultState);
    const persisted = migrator.run(persistence, defaultPersisted);
    if (persisted !== defaultPersisted) {
      defaultState = codec.decode(persisted);
    }
    super(defaultState);

    effect(() => {
      persistence.put(codec.encode(this.state));
    });
  }
}

class IdentityCodec<T> implements PersistenceCodec<T, T> {
  decode = identity;
  encode = identity;
}

class NonMigrationManager<
  T extends VersionedObject,
> extends MigrationManager<T> {
  override run(persistence: Persistence<T>, defaultValue: T): T {
    let persisted = persistence.get() ?? defaultValue;
    if (persisted._version !== defaultValue._version) {
      persisted = defaultValue;
    }
    persistence.put(persisted);
    return persisted;
  }
}
