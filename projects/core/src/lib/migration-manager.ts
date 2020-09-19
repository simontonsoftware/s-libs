import { assert } from './assert';
import { Persistence } from './persistence';

/**
 * Objects that can be managed by `MigrationManager` must conform to this interface.
 */
export interface VersionedObject {
  _version: number;
}

/**
 * A migration that can be registered with `MigrationManager`. Note that the function does not need to migrate all the way to `targetVersion`, only to something higher than `source._version`. Usually a migration will only upgrade by 1.
 */
export type MigrateFunction<T> = (source: T, targetVersion: number) => T;

/**
 * Use to migrate "versioned objects" from an old version to the latest. This is useful e.g. when keeping state in `Persistence`, and you release a new version of your app that changes its format.
 *
 * For example, say your app persists an object with the shape `{ _version: 3, key_1: string }`. You change your code to remove the underscore from `key_1`, so you want to migrate data on users' machines accordingly. Bump your version to 4 and use `MigrationManager` like this:
 *
 * ```ts
 * interface MyData extends VersionedObject {
 *   _version: number;
 *   key1: string;
 * }
 *
 * // simulate old data in the previous format
 * const persistence = new Persistence<MyData>('my key');
 * persistence.put({ _version: 3, key_1: 'my string' } as any);
 *
 * const migrater = new MigrationManager<MyData>();
 * migrater.registerMigration(3, (oldObject: any) => {
 *   return { _version: 4, key1: oldObject.key_1 };
 * });
 *
 * const defaultData = { _version: 4, key1: 'default value' };
 * migrater.run(persistence, defaultData);
 * // ^ returns { _version: 4, key1: 'my string' }
 *
 * persistence.clear();
 * migrater.run(persistence, defaultData);
 * // ^ returns defaultData
 * ```
 */
export class MigrationManager<T extends VersionedObject> {
  private migrations = new Map<number | undefined, MigrateFunction<T>>();

  /**
   * Returns the value from `persistence`, upgraded to match the version in `defaultValue`. If `persistence` was empty, returns `defaultValue` directly. Updates `peristence` to reflect the returned value.
   *
   * If an error is thrown by a migration, see `onError()` for details.
   */
  run(persistence: Persistence<T>, defaultValue: T): T {
    let object: T = persistence.get();
    if (object?._version === defaultValue._version) {
      return object;
    }

    if (object) {
      try {
        object = this.upgrade(object, defaultValue._version);
      } catch (error) {
        object = this.onError(error, object, defaultValue);
      }
    } else {
      object = defaultValue;
    }
    persistence.put(object);
    return object;
  }

  /**
   * Runs any registered migrations necessary to convert `source` to `targetVersion`. If it is already at `targetVersion`, no migrations run and it is returned unmodified.
   *
   * If you are using `Persistence` you will probably not call this directly; use `.run()` instead.
   */
  upgrade(object: T, targetVersion: number): T {
    let lastVersion = object._version;
    assert(lastVersion === undefined || lastVersion <= targetVersion);
    while (lastVersion !== targetVersion) {
      object = this.upgradeOneStep(object, targetVersion);
      const newVersion = object._version;
      if (lastVersion) {
        assert(
          newVersion > lastVersion,
          `Migration from ${lastVersion} set version to ${newVersion}. That is not an upgrade...`,
        );
      }
      assert(
        newVersion <= targetVersion,
        `${newVersion} is past the target version of ${targetVersion}`,
      );
      lastVersion = newVersion;
    }
    return object;
  }

  /**
   * Registers a function to update an object that is currently at `sourceVersion`. The function must return a new object at a higher version number. Most commonly each migration will upgrade the object by only 1 version. The output of the older migrations will be passed in turn to newer migrations until the target version is reached.
   *
   * Use `undefined` as the `sourceVersion` to handle migrations from a legacy format that did not have the `_version` key.
   *
   * `migrateFunction` will be called with the migration manager itself as `this`. That allows subclasses to pass in methods as a migration function without any special binding. E.g.:
   *
   * ```ts
   * class MigrationService extends MigrationManager<MyState> {
   *   constructor(private messaging: MessagingService) {
   *     super();
   *     this.registerMigration(1, this.migrateFrom1); // no special binding
   *   }
   *
   *   private migrateFrom1(source: MyState) {
   *     this.messaging.show("You've been upgraded!"); // you can still use `this`
   *     return { ...source, _version: 2 };
   *   }
   * }
   * ```
   */
  registerMigration(
    sourceVersion: number | undefined,
    migrateFunction: MigrateFunction<T>,
  ): void {
    this.migrations.set(sourceVersion, migrateFunction.bind(this));
  }

  /**
   * Handles errors thrown by a registered migration during `run()`. This is not used if `upgrade()` is called directly.
   *
   * This implementation simply rethrows the error so that it propagates out of `run()`. If overridden to return a value, that will be used as the result of `run()`.
   *
   * You could use this to e.g. to provide a nice message to the user explaining that their data couldn't be recovered, and use the default value.
   *
   * @param _object the object taken from persistence, before any migrations ran
   * @param _defaultValue the default value passed to `run()`
   */
  protected onError(error: any, _object: unknown, _defaultValue: T): T {
    throw error;
  }

  private upgradeOneStep(upgradable: T, targetVersion: number): T {
    const version = upgradable._version;
    const migrationFunction = this.migrations.get(version);
    if (!migrationFunction) {
      throw new Error(`Unable to migrate from version ${version}`);
    }

    return migrationFunction(upgradable, targetVersion);
  }
}
