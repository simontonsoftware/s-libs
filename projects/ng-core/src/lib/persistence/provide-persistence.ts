import {
  EffectRef,
  EnvironmentProviders,
  ErrorHandler,
  inject,
  InjectionToken,
  Injector,
  provideAppInitializer,
  runInInjectionContext,
  Signal,
} from '@angular/core';
import { AsyncPersistence, Migrations, VersionedObject } from '@s-libs/js-core';
import { identity } from '@s-libs/micro-dash';
import { debounceWhileHandling } from '../debounce-while-handling';

/**
 * Reads state from IndexedDB during app initialization, passes it to your `hydrate` function, and saves changes (from `hydrate`'s returned signal) back to IndexedDB for the rest of the app's lifecycle.
 */
export function providePersistence<
  S,
  P extends VersionedObject = VersionedObject,
>(config: PersistenceConfig<S, P>): EnvironmentProviders {
  return provideAppInitializer(async () => {
    const p = new Persister<S, P>(config);
    const signal = await p.hydrate();
    p.persist(signal);
  });
}

/**
 * Configures the behavior of {@linkcode providePersistence}.
 */
export interface PersistenceConfig<
  S,
  P extends VersionedObject = VersionedObject,
> {
  /**
   * The name of the IndexedDB database where the state will be persisted.
   */
  dbName: string;

  /**
   * The initial state to use when there is nothing persisted. If provided as a function, it will only be called when nothing is persisted.
   */
  freshState: MaybeLazy<S>;

  /**
   * Called during app initialization with the persisted or fresh state. Each emission from the returned signal will be saved back to IndexedDB, so that the most recent state will be hydrated the next time the app starts.
   */
  hydrate: (initialState: S) => Signal<S>;

  /**
   * Used on persisted state before it is passed to {@linkcode hydrate}. This allows you to define migrations that transform old versions of the persisted state into the current format.
   */
  migrations?: MaybeLazy<Migrations<P>>;

  /**
   * Converts between state format used in the app (i.e. passed to/from {@linkcode hydrate}) and the format used for persistence (i.e. stored in IndexedDB).
   */
  codec?: MaybeLazy<PersistenceCodec<S, P>>;

  /**
   * Called when an error occurs any time before calling {@linkcode hydrate}. Allows you to provide a fallback state used instead. If not provided, the error will be passed to the global `ErrorHandler` and hydration will proceed with {@linkcode freshState}.
   */
  onPreHydrateError?: (err: unknown, persistedState?: P) => S;

  /**
   * Called when an error occurs while encoding or saving the state to IndexedDB. If not provided, persistence will be halted and the error will propagate unhandled.
   *
   * @param effectRef Call `destroy()` on this reference to halt persistence.
   */
  onSaveError?: (err: unknown, effectRef: EffectRef) => void;
}

/**
 * Defines how to encode and decode the state for persistence.
 */
export interface PersistenceCodec<State, Persisted> {
  /**
   * Convert from the format that is kept in the store to what is persisted.
   */
  encode: (decoded: State) => Persisted;

  /**
   * Convert from the format that is persisted to what is kept in the store.
   */
  decode: (encoded: Persisted) => State;
}

type MaybeLazy<T> = T | (() => T);

export const PERSISTENCE_BACKEND_FACTORY = new InjectionToken(
  'PERSISTENCE_BACKEND_FACTORY',
  {
    factory:
      () =>
      (dbName: string): AsyncPersistence<any> =>
        new AsyncPersistence(dbName),
  },
);

class Persister<S, P extends VersionedObject> {
  #backend: AsyncPersistence<P>;
  #injector = inject(Injector);
  #codec: PersistenceCodec<S, P>;

  constructor(private config: PersistenceConfig<S, P>) {
    this.#backend = inject(PERSISTENCE_BACKEND_FACTORY)(config.dbName);
    this.#codec = this.#resolve(config.codec ?? identityCodec);
  }

  async hydrate(): Promise<Signal<S>> {
    let persisted: P | undefined;
    let initialState: S;
    try {
      persisted = await this.#backend.get();

      if (persisted && this.config.migrations) {
        persisted = this.#resolve(this.config.migrations).run(persisted);
      }
      if (persisted) {
        initialState = this.#codec.decode(persisted);
      } else {
        initialState = this.#resolve(this.config.freshState);
      }
    } catch (e) {
      this.#withInjection(() => {
        if (this.config.onPreHydrateError) {
          initialState = this.config.onPreHydrateError(e, persisted);
        } else {
          inject(ErrorHandler).handleError(e);
          initialState = this.#resolve(this.config.freshState);
        }
      });
    }
    return this.#withInjection(() => this.config.hydrate(initialState));
  }

  persist(signal: Signal<S>): void {
    this.#withInjection(() => {
      const effectRef = debounceWhileHandling(signal, async (state) => {
        try {
          await this.#backend.put(this.#codec.encode(state));
        } catch (e) {
          this.#withInjection(() => {
            if (this.config.onSaveError) {
              this.config.onSaveError(e, effectRef);
            } else {
              effectRef.destroy();
              throw e;
            }
          });
        }
      });
    });
  }

  #resolve<T>(maybeLazy: MaybeLazy<T>): T {
    if (typeof maybeLazy === 'function') {
      return this.#withInjection(maybeLazy as () => T);
    } else {
      return maybeLazy;
    }
  }

  #withInjection<T>(fn: () => T): T {
    return runInInjectionContext(this.#injector, fn);
  }
}

const identityCodec: PersistenceCodec<any, any> = {
  decode: identity,
  encode: identity,
};
