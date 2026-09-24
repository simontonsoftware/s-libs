import {
  ErrorHandler,
  inject,
  PLATFORM_ID,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Migrations, VersionedObject } from '@s-libs/js-core';
import { last, noop } from '@s-libs/micro-dash';
import {
  _MockPersistenceProvider,
  AngularContext,
  AsyncMethodController,
  MockController,
  MockPersistenceBackend,
} from '@s-libs/ng-vitest';
import {
  PersistenceCodec,
  PersistenceConfig,
  providePersistence,
} from './provide-persistence';
import { _provideMockPersistence } from './provide-persistence.harness';

describe('providePersistence()', () => {
  class CounterState {
    _version = 1;

    constructor(public count = 0) {}
  }

  class CounterContext<
    P extends VersionedObject = CounterState,
  > extends AngularContext {
    initialState?: P;

    // eslint-disable-next-line @angular-eslint/prefer-signals -- init is delayed
    signal!: WritableSignal<CounterState>;

    constructor(config: Partial<PersistenceConfig<CounterState, P>> = {}) {
      const fullConfig: PersistenceConfig<CounterState, P> = {
        dbName: 'theKey',
        freshState: new CounterState(),
        hydrate: (initialState) => {
          this.signal = signal(initialState);
          return this.signal;
        },
        ...config,
      };
      super({
        providers: [
          providePersistence(fullConfig),
          _provideMockPersistence(
            _MockPersistenceProvider,
            () => this.initialState,
          ),
        ],
      });
    }

    async setCount(value: number): Promise<void> {
      this.signal.set(new CounterState(value));
      await this.tick();
    }

    async getPersisted(): Promise<P | undefined> {
      return this.getPersistence().get();
    }

    getPersistence(): MockPersistenceBackend<P> {
      return MockPersistenceBackend.get('theKey') as MockPersistenceBackend<P>;
    }

    protected override async init(): Promise<void> {
      await super.init();
      await this.tick();
    }
  }

  describe('persistence', () => {
    // I went back & forth on whether to save the initial state. I think it's useful so that callers can use `buildDefaultState()` as an indication that it's a brand-new user who has never visited the page before.
    it('persists changes, including initial state', async () => {
      const ctx = new CounterContext();
      await ctx.run(async () => {
        expect(await ctx.getPersisted()).toEqual(new CounterState());

        await ctx.setCount(1);
        expect(await ctx.getPersisted()).toEqual(new CounterState(1));
      });
    });

    it('debounces saves while the previous one is pending', async () => {
      const ctx = new CounterContext();
      await ctx.run(async () => {
        const persistence = ctx.getPersistence();
        const put = new MockController(vi.spyOn(persistence, 'put'));

        persistence.pause();
        await ctx.setCount(1);
        put.expectOne([new CounterState(1)]);

        await ctx.setCount(2);
        await ctx.setCount(3);
        put.verify();

        await persistence.resume();
        put.expectOne([new CounterState(3)]);
        put.verify();
      });
    });
  });

  describe('config.freshState', () => {
    it('used when nothing is saved', async () => {
      const ctx = new CounterContext();
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual(new CounterState());
      });
    });

    it('can inject dependencies', async () => {
      const state = new CounterState();
      const ctx = new CounterContext({
        freshState: (): CounterState => {
          expect(inject(PLATFORM_ID)).toBeDefined();
          return state;
        },
      });
      await ctx.run(() => {
        expect(ctx.signal()).toBe(state);
      });
    });

    it('not called when something is persisted', async () => {
      const freshState = vi.fn();
      const ctx = new CounterContext({ freshState });
      ctx.initialState = new CounterState();
      await ctx.run(async () => {
        expect(freshState).not.toHaveBeenCalled();
      });
    });
  });

  describe('config.hydrate', () => {
    it('receives the persisted state', async () => {
      const ctx = new CounterContext();
      ctx.initialState = new CounterState();
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual(ctx.initialState);
      });
    });

    it('can inject dependencies', async () => {
      const ctx = new CounterContext({
        hydrate: (): Signal<CounterState> => {
          expect(inject(PLATFORM_ID)).toBeDefined();
          return signal(new CounterState());
        },
      });
      await ctx.run(noop);
    });
  });

  describe('config.migrations', () => {
    let migrations: Migrations<CounterState>;
    beforeEach(() => {
      migrations = new Migrations<CounterState>(2);
      migrations.register(1, (state) => ({ ...state, _version: 2 }));
    });

    it('run when needed', async () => {
      const ctx = new CounterContext({ migrations });
      ctx.initialState = new CounterState();
      await ctx.run(async () => {
        expect(ctx.signal()._version).toBe(2);
      });
    });

    it('is OK with no persisted state', async () => {
      const ctx = new CounterContext({ migrations });
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual(new CounterState());
      });
    });

    it('can inject dependencies', async () => {
      let injected: unknown;
      const ctx = new CounterContext({
        migrations: (): Migrations<CounterState> => {
          injected = inject(PLATFORM_ID);
          return migrations;
        },
      });
      ctx.initialState = new CounterState();
      await ctx.run(async () => {
        expect(injected).toBeDefined();
      });
    });
  });

  describe('config.codec', () => {
    interface Persisted {
      _version: number;
      COUNT: number;
    }

    let codec: PersistenceCodec<CounterState, Persisted>;
    beforeEach(() => {
      codec = {
        encode: (state: CounterState): Persisted => ({
          _version: state._version,
          COUNT: state.count,
        }),
        decode: (persisted: Persisted): CounterState => ({
          _version: persisted._version,
          count: persisted.COUNT,
        }),
      };
    });

    it('encodes', async () => {
      const ctx = new CounterContext({ codec });
      await ctx.run(async () => {
        ctx.signal.set({ _version: 1, count: 1 });
        await ctx.tick();
        expect(await ctx.getPersisted()).toEqual({ _version: 1, COUNT: 1 });
      });
    });

    it('decodes', async () => {
      const ctx = new CounterContext({ codec });
      ctx.initialState = { _version: 1, COUNT: 1 };
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual({ _version: 1, count: 1 });
      });
    });

    it('is OK with no persisted state', async () => {
      const ctx = new CounterContext({ codec });
      await ctx.run(async () => {
        expect(ctx.signal()).toEqual(new CounterState());
      });
    });

    it('can inject dependencies', async () => {
      const ctx = new CounterContext({
        codec: (): PersistenceCodec<CounterState, Persisted> => {
          expect(inject(PLATFORM_ID)).toBeDefined();
          return codec;
        },
      });
      await ctx.run(noop);
    });
  });

  describe('config.onPreHydrateError', () => {
    class ErrorContext extends CounterContext {
      migrationError = new Error();

      constructor(
        config: Partial<PersistenceConfig<CounterState, CounterState>>,
      ) {
        const migrations = new Migrations<CounterState>(2);
        migrations.register(1, () => {
          throw this.migrationError;
        });
        super({ migrations, ...config });
        this.initialState = new CounterState(-1);
      }
    }

    it('when undefined, passes to error handler and uses default', async () => {
      const handleError = vi.fn();
      TestBed.overrideProvider(ErrorHandler, { useValue: { handleError } });
      const ctx = new ErrorContext({});
      await ctx.run(async () => {
        expect(handleError).toHaveBeenCalledExactlyOnceWith(ctx.migrationError);
        expect(ctx.signal()).toEqual(new CounterState());
      });
    });

    it('receives the thrown error and persisted object', async () => {
      const onError = vi.fn();
      const ctx = new ErrorContext({ onPreHydrateError: onError });
      await ctx.run(async () => {
        expect(onError).toHaveBeenCalledExactlyOnceWith(
          ctx.migrationError,
          ctx.initialState,
        );
      });
    });

    it('can be overridden to return the new final state', async () => {
      const newState = new CounterState(3);
      const ctx = new ErrorContext({
        onPreHydrateError: (): CounterState => newState,
      });
      await ctx.run(async () => {
        expect(ctx.signal()).toBe(newState);
      });
    });

    it('has no effect when there is no error', async () => {
      const onPreHydrateError = vi.fn();
      const ctx = new ErrorContext({
        onPreHydrateError,
        migrations: undefined,
      });
      await ctx.run(async () => {
        expect(onPreHydrateError).not.toHaveBeenCalled();
      });
    });

    it('can inject dependencies', async () => {
      let platformId: unknown;
      const ctx = new ErrorContext({
        onPreHydrateError: (): CounterState => {
          platformId = inject(PLATFORM_ID);
          return new CounterState();
        },
      });
      await ctx.run(async () => {
        expect(platformId).toBeDefined();
      });
    });
  });

  describe('config.onSaveError', () => {
    let onUnhandledRejection = vi.fn();
    beforeEach(() => {
      window.addEventListener('unhandledrejection', onUnhandledRejection);
    });
    afterEach(() => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    });

    it('receives errors during save', async () => {
      const onSaveError = vi.fn(noop);
      const ctx = new CounterContext({ onSaveError });
      await ctx.run(async () => {
        const put = new AsyncMethodController(ctx.getPersistence(), 'put');
        const theError = new Error('unique message');

        await ctx.setCount(1);
        await put.expectOne([new CounterState(1)]).error(theError);

        expect(onSaveError).toHaveBeenCalledWith(theError, expect.anything());
      });
    });

    it('can (optionally) halt persistence', async () => {
      const onSaveError =
        vi.fn<NonNullable<PersistenceConfig<CounterState>['onSaveError']>>();
      const ctx = new CounterContext({ onSaveError });
      await ctx.run(async () => {
        const persistence = ctx.getPersistence();
        const put = new AsyncMethodController(persistence, 'put');

        await ctx.setCount(1);
        await put.expectOne([new CounterState(1)]).error('');

        await ctx.setCount(2);
        await put.expectOne([new CounterState(2)]);

        const effectRef = last(onSaveError.mock.calls)[1];
        effectRef.destroy();
        await ctx.setCount(3);
        put.verify();
      });
    });

    it('halts and rethrows by default', async () => {
      const ctx = new CounterContext();
      await ctx.run(async () => {
        const put = new AsyncMethodController(ctx.getPersistence(), 'put');
        const theError = new Error('unique message');

        await ctx.setCount(1);
        await put.expectOne([new CounterState(1)]).error(theError);
        expect(onUnhandledRejection).toHaveBeenCalledWith(
          expect.objectContaining({ reason: theError }),
        );

        await ctx.setCount(2);
        put.verify();
      });
    });

    it('can inject dependencies', async () => {
      let platformId: unknown;
      const ctx = new CounterContext({
        onSaveError: (): void => {
          platformId = inject(PLATFORM_ID);
        },
      });
      await ctx.run(async () => {
        const put = new AsyncMethodController(ctx.getPersistence(), 'put');

        await ctx.setCount(1);
        await put.expectOne([new CounterState(1)]).error('blah');

        expect(platformId).toBeDefined();
      });
    });
  });
});
