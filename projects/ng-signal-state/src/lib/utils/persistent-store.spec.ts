import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MigrationManager, VersionedObject } from '@s-libs/js-core';
import { omit } from '@s-libs/micro-dash';
import { PersistenceCodec, PersistentStore } from './persistent-store';

describe('PersistentStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  // this gives users a way to test whether it's a fresh install
  it('uses `defaultState` directly (not a copy) when there is nothing persisted', () => {
    TestBed.runInInjectionContext(() => {
      const codec = {
        encode: (): VersionedObject => ({ _version: -1 }),
        decode: (): VersionedObject => ({ _version: -2 }),
      };
      const defaultState = { _version: 1 };

      const store = new PersistentStore('meh', defaultState, { codec });

      expect(store.state()).toBe(defaultState);
    });
  });

  it('overwrites the store with `defaultState` on a version change', () => {
    localStorage.setItem('thekey', '{"_version": 0, "myKey": "saved"}');
    TestBed.runInInjectionContext(() => {
      const defaultState = { _version: 1, source: 'default' };

      const store = new PersistentStore('thekey', defaultState);

      expect(store.state()).toBe(defaultState);
    });
  });

  describe('documentation', () => {
    it('is working for the simple example', async () => {
      TestBed.runInInjectionContext(() => {
        /* eslint-disable camelcase */

        class MyState implements VersionedObject {
          _version = 1;
          my_state_key = 'my state value';
        }

        class MyStore extends PersistentStore<MyState> {
          constructor() {
            super('myPersistenceKey', new MyState());
          }
        }

        let store = new MyStore();
        store('my_state_key').set('my new value');

        // simulate the user leaving the page and coming back later ...
        TestBed.flushEffects();
        store = new MyStore();

        expect(store.state().my_state_key).toBe('my new value');
      });
    });

    it('is working for the migration example', () => {
      localStorage.setItem(
        'myPersistenceKey',
        '{ "_version": 1, "my_state_key": "my persisted value" }',
      );
      TestBed.runInInjectionContext(() => {
        class MyState implements VersionedObject {
          _version = 2; // bump version to 2
          myStateKey = 'my default value'; // schema change: my_state_key => myStateKey
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
        expect(store.state().myStateKey).toBe('my persisted value');
      });
    });

    it('is working for the codec example', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        class MyState implements VersionedObject {
          _version = 1;
          sessionStart = Date.now();
        }

        type Persisted = Omit<MyState, 'sessionStart'>;

        class MyCodec implements PersistenceCodec<MyState, Persisted> {
          encode(left: MyState): Persisted {
            return omit(left, 'sessionStart');
          }

          decode(right: Persisted): MyState {
            return { ...right, sessionStart: Date.now() };
          }
        }

        class MyStore extends PersistentStore<MyState, Persisted> {
          constructor() {
            super('myPersistenceKey', new MyState(), { codec: new MyCodec() });
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
      });
    }));
  });
});
