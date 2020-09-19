import { expectSingleCallAndReset } from 's-ng-dev-utils';
import { MigrationManager, VersionedObject } from './migration-manager';
import { Persistence } from './persistence';

describe('MigrationManager', () => {
  it('works for the example in the docs', () => {
    interface MyData extends VersionedObject {
      _version: number;
      key1: string;
    }

    // simulate old data in the previous format
    const persistence = new Persistence<MyData>('my key');
    persistence.put({ _version: 3, key_1: 'my string' } as any);

    const migrater = new MigrationManager<MyData>();
    migrater.registerMigration(3, (oldObject: any) => {
      return { _version: 4, key1: oldObject.key_1 };
    });

    const defaultData = { _version: 4, key1: 'default value' };
    expect(migrater.run(persistence, defaultData)).toEqual({
      _version: 4,
      key1: 'my string',
    });

    persistence.clear();
    expect(migrater.run(persistence, defaultData)).toBe(defaultData);
  });

  it('works for the other example in the docs', () => {
    class MyState {
      constructor(public _version: number) {}
    }
    class MessagingService {
      show = jasmine.createSpy();
    }

    class MigrationService extends MigrationManager<MyState> {
      constructor(private messaging: MessagingService) {
        super();
        this.registerMigration(1, this.migrateFrom1); // no special binding
      }

      private migrateFrom1(source: MyState): MyState {
        this.messaging.show("You've been upgraded!"); // you can still use `this`
        return { ...source, _version: 2 };
      }
    }

    const messagingService = new MessagingService();
    const migrater = new MigrationService(messagingService);
    migrater.upgrade(new MyState(1), 2);
    expectSingleCallAndReset(messagingService.show, "You've been upgraded!");
  });

  describe('.run()', () => {
    class MyData implements VersionedObject {
      constructor(public _version: number, public key: string) {}
    }

    let persistence: Persistence<MyData>;
    let migrater: MigrationManager<MyData>;
    beforeEach(() => {
      persistence = new Persistence<MyData>('my key');
      migrater = new MigrationManager<MyData>();
    });

    it('returns the persisted object if already up-to-date', () => {
      persistence.put(new MyData(2, 'hi'));
      const result = migrater.run(persistence, new MyData(2, 'there'));
      expect(result).toEqual({ _version: 2, key: 'hi' });
    });

    it('upgrades the object to match the version of `defaultValue`, and stores it for next time', () => {
      persistence.put(new MyData(1, 'hi'));
      const upgraded = new MyData(2, 'there');
      migrater.registerMigration(1, () => upgraded);

      const result = migrater.run(persistence, new MyData(2, 'world'));

      expect(result).toEqual(upgraded);
      expect(persistence.get()).toEqual({ _version: 2, key: 'there' });
    });

    it('uses `defaultValue` if persistence is empty', () => {
      persistence.clear();
      const defaultValue = new MyData(1, 'val');
      const result = migrater.run(persistence, defaultValue);
      expect(result).toBe(defaultValue);
    });
  });

  describe('.upgrade', () => {
    it('can upgrade multiple versions', () => {
      class State {
        counter = 0;
        constructor(public _version: number) {}
      }
      const migrater = new MigrationManager<State>();
      migrater.registerMigration(1, (source) => ({
        _version: 2,
        counter: source.counter + 1,
      }));
      migrater.registerMigration(2, (source) => ({
        _version: 3,
        counter: source.counter + 1,
      }));
      expect(migrater.upgrade(new State(1), 3)).toEqual({
        _version: 3,
        counter: 2,
      });
    });

    it('can handle skipping migrations', () => {
      class State {
        counter = 0;
        constructor(public _version: number) {}
      }
      const migrater = new MigrationManager<State>();
      migrater.registerMigration(1, (source) => ({
        _version: 3,
        counter: source.counter + 1,
      }));
      migrater.registerMigration(2, () => {
        throw new Error('should not be called');
      });
      expect(migrater.upgrade(new State(1), 3)).toEqual({
        _version: 3,
        counter: 1,
      });
    });

    it("errs when a migration doesn't bump the version (instead of e.g. infinitely looping)", () => {
      class State {
        constructor(public _version: number) {}
      }
      const migrater = new MigrationManager<State>();
      migrater.registerMigration(1, () => ({ _version: 1 }));
      expect(() => {
        migrater.upgrade(new State(1), 2);
      }).toThrowError(
        'Migration from 1 set version to 1. That is not an upgrade...',
      );
    });
  });

  describe('.registerMigration()', () => {
    it('calls the migration with `this` context', () => {
      class State {
        constructor(public _version: number) {}
      }
      const migration = jasmine.createSpy().and.returnValue(new State(2));
      const migrater = new MigrationManager<State>();
      migrater.registerMigration(1, migration);
      migrater.upgrade(new State(1), 2);
      expect(migration.calls.first().object).toBe(migrater);
    });
  });

  describe('.onError()', () => {
    class MyData implements VersionedObject {
      constructor(public _version: number) {}
    }

    let persistence: Persistence<MyData>;
    let originalError: Error;
    let defaultState: MyData;
    beforeEach(() => {
      persistence = new Persistence<MyData>('my key');
      originalError = new Error();
      defaultState = new MyData(2);

      persistence.put(new MyData(1));
    });

    function registerAndRun(migrater: MigrationManager<MyData>): any {
      migrater.registerMigration(1, () => {
        throw originalError;
      });
      return migrater.run(persistence, defaultState);
    }

    it('propagates the original error by default', () => {
      expect(() => {
        registerAndRun(new MigrationManager<MyData>());
      }).toThrow(originalError);
    });

    it('can propogate a different error', () => {
      const differentError = new Error();
      const migrater = new (class extends MigrationManager<MyData> {
        protected onError(): MyData {
          throw differentError;
        }
      })();
      expect(() => {
        registerAndRun(migrater);
      }).toThrow(differentError);
    });

    it('can provide its own value to be returned from `run()`', () => {
      const newValue = new MyData(2);
      const migrater = new (class extends MigrationManager<MyData> {
        protected onError(): MyData {
          return newValue;
        }
      })();

      const result = registerAndRun(migrater);

      expect(result).toBe(newValue);
    });

    it('receives the correct arguments', () => {
      const originalState = persistence.get();
      const onError = jasmine.createSpy();
      const migrater = new (class extends MigrationManager<MyData> {
        protected onError = onError;
      })();

      registerAndRun(migrater);

      expectSingleCallAndReset(
        onError,
        originalError,
        originalState,
        defaultState,
      );
    });
  });
});
