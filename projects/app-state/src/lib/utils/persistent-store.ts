import {
  MigrationManager,
  Persistence,
  VersionedObject,
} from '@s-libs/js-core';
import { skip } from 'rxjs/operators';
import { RootStore } from '../root-store';

/**
 * A store that is automatically saved to and restored from local storage. This is suitable for small stores that can very quickly be (de)serialized to/from JSON without any noticeable delay.
 *
 * ```ts
 * class MyState implements VersionedObject {
 *   _version = 1;
 *   my_state_key = 'my state value';
 * }
 *
 * class MyStore extends PersistentStore<MyState> {
 *   constructor() {
 *     super('myPersistenceKey', new MyState(), new MigrationManager());
 *   }
 * }
 *
 * let store = new MyStore();
 * store('my_state_key').set('my new value');
 *
 * // the user leaves the page and comes back later ...
 *
 * store = new MyStore();
 * expect(store.state().my_state_key).toBe('my new value');
 * ```
 *
 * Later when you want to change the schema of the state, it's time to take advantage of the `{@link MigrationManager}:
 *
 * ```ts
 * class MyState implements VersionedObject {
 *   _version = 2; // bump version to 2
 *   myStateKey = 'my state value'; // schema change: my_state_key => myStateKey
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
 *     super('myPersistenceKey', new MyState(), new MyMigrationManager());
 *   }
 * }
 *
 * // the store gets the value persisted from version 1 in our previous example
 * const store = new MyStore();
 * expect(store.state().myStateKey).toBe('my new value');
 * ```
 */
export class PersistentStore<T extends VersionedObject> extends RootStore<T> {
  /**
   * @param persistenceKey the key in local storage at which to persist the state
   * @param defaultState used when the state has not been persisted yet
   * @param migrator used to update the state when it was at a lower {@link VersionedObject._version} when it was last persisted
   */
  constructor(
    persistenceKey: string,
    defaultState: T,
    migrator: MigrationManager<T>,
  ) {
    const persistence = new Persistence<T>(persistenceKey);
    super(migrator.run(persistence, defaultState));

    this.$.pipe(skip(1)).subscribe((state) => {
      persistence.put(state);
    });
  }
}
