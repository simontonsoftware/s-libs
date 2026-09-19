import { assert } from '../assert';

/**
 * Objects that can be managed by {@linkcode Migrations} must conform to this interface.
 */
export interface VersionedObject {
  _version: number;
}

/**
 * A migration that can be registered with `Migrations`. Note that the function does not need to migrate all the way to `targetVersion`, only to something higher than `source._version`. Usually a migration will only upgrade by 1.
 */
export type MigrateFunction<T> = (source: T, targetVersion: number) => T;

/**
 * Use to migrate {@linkcode VersionedObject}s from an old version to the latest. This is useful e.g. when keeping state in {@linkcode import('./async-persistence').AsyncPersistence}, and you release a new version of your app that changes its format.
 *
 * For example, say your app persists an object with the shape `{ _version: 3, key_1: string }`. You change your code to remove the underscore from `key_1`, so you want to migrate data on users' machines accordingly. Bump your version to 4 and use {@linkcode Migrations} like this:
 *
 * ```ts
 * interface MyData extends VersionedObject {
 *   _version: number;
 *   key1: string;
 * }
 *
 * const oldData: any = { _version: 3, key_1: 'my string' };
 *
 * const migrations = new Migrations<MyData>(4);
 * migrations.register(3, (oldObject: any) => {
 *   return { _version: 4, key1: oldObject.key_1 };
 * });
 *
 * const newData = migrations.run(oldData);
 * expect(newData).toEqual({ _version: 4, key1: 'my string' });
 * ```
 */
export class Migrations<T extends VersionedObject> {
  #migrations = new Map<number | undefined, MigrateFunction<T>>();

  constructor(private targetVersion: number) {}

  /**
   * Runs any registered migrations necessary to convert `source` to `targetVersion`. If it is already at `targetVersion`, no migrations run and it is returned unmodified.
   */
  run(object: T): T {
    let lastVersion = object._version;
    assert(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we don't assume as much type safety here, since it may need migration to comply!
      lastVersion === undefined || lastVersion <= this.targetVersion,
      `Object is at version ${lastVersion}, which is already past the target version (${this.targetVersion}). Is it from the future?`,
    );
    while (lastVersion !== this.targetVersion) {
      object = this.#upgradeOneStep(object);
      const newVersion = object._version;
      if (lastVersion) {
        assert(
          newVersion > lastVersion,
          `Migrating from version ${lastVersion} resulted in version ${newVersion}. That is not an upgrade.`,
        );
      }
      assert(
        newVersion <= this.targetVersion,
        `Migrated to version ${newVersion}, which is past the target version (${this.targetVersion})`,
      );
      lastVersion = newVersion;
    }
    return object;
  }

  /**
   * Registers a function to update an object that is currently at `sourceVersion`. The function must return a new object at a higher version number. Most commonly, each migration will upgrade the object by only 1 version. The output of the older migrations will be passed in turn to newer migrations until the target version is reached.
   *
   * Use `undefined` as the `sourceVersion` to handle migrations from a legacy format that did not have the `_version` key.
   *
   * `migrateFunction` will be called with the migration manager itself as `this`. That allows subclasses to pass in methods as a migration function without any special binding. E.g.:
   *
   * ```ts
   * class MigrationService extends MigrationManager<MyState> {
   *   constructor(private messaging: MessagingService) {
   *     super();
   *     this.registerMigration(1, this.#migrateFrom1); // no special binding
   *   }
   *
   *   #migrateFrom1(source: MyState): MyState {
   *     this.messaging.show("You've been upgraded!"); // you can still use `this`
   *     return { ...source, _version: 2 };
   *   }
   * }
   * ```
   */
  register(
    sourceVersion: number | undefined,
    migrateFunction: MigrateFunction<T>,
  ): void {
    this.#migrations.set(sourceVersion, migrateFunction);
  }

  #upgradeOneStep(upgradable: T): T {
    const version = upgradable._version;
    const migrationFunction = this.#migrations.get(version);
    if (!migrationFunction) {
      throw new Error(`Unable to migrate from version ${version}`);
    }

    return migrationFunction(upgradable, this.targetVersion);
  }
}
