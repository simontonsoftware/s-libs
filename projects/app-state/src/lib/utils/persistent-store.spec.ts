import { MigrationManager, VersionedObject } from '@s-libs/js-core';
import { PersistentStore } from './persistent-store';

describe('PersistentStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it('works for the first example in the docs', () => {
    class MyState implements VersionedObject {
      _version = 1;
      // eslint-disable-next-line camelcase
      my_state_key = 'my state value';
    }

    class MyStore extends PersistentStore<MyState> {
      constructor() {
        super('myPersistenceKey', new MyState(), new MigrationManager());
      }
    }

    let store = new MyStore();
    store('my_state_key').set('my new value');

    // the user leaves the page and comes back later ...

    store = new MyStore();
    expect(store.state().my_state_key).toBe('my new value');
  });

  it('works for the second example in the docs', () => {
    localStorage.setItem(
      'myPersistenceKey',
      '{ "_version": 1, "my_state_key": "my new value" }',
    );

    class MyState implements VersionedObject {
      _version = 2; // bump version to 2
      myStateKey = 'my state value'; // schema change: my_state_key => myStateKey
    }

    class MyMigrationManager extends MigrationManager<MyState> {
      constructor() {
        super();
        this.registerMigration(1, this.#migrateFromV1);
      }

      #migrateFromV1(oldState: any): any {
        return { _version: 2, myStateKey: oldState.my_state_key };
      }
    }

    class MyStore extends PersistentStore<MyState> {
      constructor() {
        // pass in our new `MyMigrationManager`
        super('myPersistenceKey', new MyState(), new MyMigrationManager());
      }
    }

    // the store gets the value persisted from version 1 in our previous example
    const store = new MyStore();
    expect(store.state().myStateKey).toBe('my new value');
  });
});
