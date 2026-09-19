import { Migrations, VersionedObject } from './migrations';

describe('Migrations', () => {
  class StringData implements VersionedObject {
    constructor(
      public _version: number,
      public key: string,
    ) {}
  }

  class VersionOnly implements VersionedObject {
    constructor(public _version: number) {}
  }

  describe('.run()', () => {
    it('upgrades the object to match `targetVersion`', () => {
      const upgraded = new StringData(2, 'there');
      const migrater = new Migrations<StringData>(2);
      migrater.register(1, () => upgraded);

      const result = migrater.run(new StringData(1, 'hi'));

      expect(result).toBe(upgraded);
    });

    it('handles upgrading from an undefined version', () => {
      const upgraded = new StringData(1, 'there');
      const migrater = new Migrations<StringData>(1);
      migrater.register(undefined, () => upgraded);

      const result = migrater.run({ key: 'hi' } as any);

      expect(result).toBe(upgraded);
    });

    it('returns the persisted object if already up-to-date', () => {
      const obj = new StringData(2, 'hi');
      const result = new Migrations<StringData>(2).run(obj);
      expect(result).toBe(obj);
    });

    it('can upgrade multiple versions', () => {
      class State {
        counter = 0;
        constructor(public _version: number) {}
      }
      const migrater = new Migrations<State>(3);
      migrater.register(1, (source) => ({
        _version: 2,
        counter: source.counter + 1,
      }));
      migrater.register(2, (source) => ({
        _version: 3,
        counter: source.counter + 1,
      }));

      expect(migrater.run(new State(1))).toEqual({
        _version: 3,
        counter: 2,
      });
    });

    it('can handle skipping migrations', () => {
      class State {
        counter = 0;
        constructor(public _version: number) {}
      }
      const migrater = new Migrations<State>(3);
      migrater.register(1, (source) => ({
        _version: 3,
        counter: source.counter + 1,
      }));
      migrater.register(2, () => {
        throw new Error('should not be called');
      });

      expect(migrater.run(new State(1))).toEqual({
        _version: 3,
        counter: 1,
      });
    });

    describe('error handling', () => {
      it("gives a nice message when a migration doesn't bump the version (instead of e.g. infinitely looping)", () => {
        const migrater = new Migrations<VersionOnly>(2);
        migrater.register(1, () => ({ _version: 1 }));

        expect(() => {
          migrater.run(new VersionOnly(1));
        }).toThrow(
          'Migrating from version 1 resulted in version 1. That is not an upgrade.',
        );
      });
    });

    it('gives a nice message when there is no migration registered for the current version', () => {
      const migrater = new Migrations<VersionOnly>(2);

      expect(() => {
        migrater.run(new VersionOnly(1));
      }).toThrow('Unable to migrate from version 1');

      expect(() => {
        migrater.run({} as VersionOnly);
      }).toThrow('Unable to migrate from version undefined');
    });

    it('gives a nice message when the object is from the future', () => {
      const migrater = new Migrations<VersionOnly>(2);

      expect(() => {
        migrater.run(new VersionOnly(3));
      }).toThrow(
        'Object is at version 3, which is already past the target version (2). Is it from the future?',
      );
    });

    it('gives a nice message when a migration jumps past the target version', () => {
      const migrater = new Migrations<VersionOnly>(2);
      migrater.register(1, () => ({ _version: 3 }));

      expect(() => {
        migrater.run(new VersionOnly(1));
      }).toThrow('Migrated to version 3, which is past the target version (2)');
    });
  });

  it('works for the example in the docs', () => {
    interface MyData extends VersionedObject {
      _version: number;
      key1: string;
    }

    const oldData: any = { _version: 3, key_1: 'my string' };

    const migrations = new Migrations<MyData>(4);
    migrations.register(3, (oldObject: any) => {
      return { _version: 4, key1: oldObject.key_1 };
    });

    const newData = migrations.run(oldData);
    expect(newData).toEqual({ _version: 4, key1: 'my string' });
  });
});
