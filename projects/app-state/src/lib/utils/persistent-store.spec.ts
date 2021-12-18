import { fakeAsync, tick } from '@angular/core/testing';
import { MigrationManager, VersionedObject } from '@s-libs/js-core';
import { omit } from '@s-libs/micro-dash';
import { PersistenceTranslator, PersistentStore } from './persistent-store';

describe('PersistentStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  describe('documentation', () => {
    it('is working for the simple example', () => {
      class MyState implements VersionedObject {
        _version = 1;
        // eslint-disable-next-line camelcase -- will fix in next version
        my_state_key = 'my state value';
      }

      class MyStore extends PersistentStore<MyState> {
        constructor() {
          super('myPersistenceKey', new MyState());
        }
      }

      let store = new MyStore();
      store('my_state_key').set('my new value');

      // the user leaves the page and comes back later ...

      store = new MyStore();
      expect(store.state().my_state_key).toBe('my new value');
    });

    it('is working for the migration example', () => {
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
          super('myPersistenceKey', new MyState(), {
            migrator: new MyMigrationManager(),
          });
        }
      }

      // the store gets the value persisted from version 1 in our previous example
      const store = new MyStore();
      expect(store.state().myStateKey).toBe('my new value');
    });

    it('is working for the translator example', fakeAsync(() => {
      class MyState implements VersionedObject {
        _version = 1;
        sessionStart = Date.now();
      }
      type Persisted = Omit<MyState, 'sessionStart'>;

      class MyTranslator implements PersistenceTranslator<MyState, Persisted> {
        toState(right: Persisted): MyState {
          return { ...right, sessionStart: Date.now() };
        }

        toPersisted(left: MyState): Persisted {
          return omit(left, 'sessionStart');
        }
      }

      class MyStore extends PersistentStore<MyState, Persisted> {
        constructor() {
          super('myPersistenceKey', new MyState(), {
            translator: new MyTranslator(),
          });
        }
      }

      const session1Start = Date.now();
      let store = new MyStore();
      expect(store.state().sessionStart).toBe(session1Start);
      expect(localStorage.getItem('myPersistenceKey')).toBe('{"_version":1}');

      // the user leaves the page and comes back later...

      tick(300_000); // 5 minutes pass
      store = new MyStore();
      expect(store.state().sessionStart).toBe(session1Start + 300_000);
    }));
  });
});
