# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [15.1.0](https://github.com/simontonsoftware/s-libs/compare/v15.0.0...v15.1.0) (2023-01-16)

### Features

- **js-core:** add `getCombinations()` ([a1ec141](https://github.com/simontonsoftware/s-libs/commit/a1ec141287d900996426a6cdc9b75dcfe6509aca)), closes [#84](https://github.com/simontonsoftware/s-libs/issues/84)
- **ng-dev:** add `AngularContext.getHarnessOrNull()` ([c2bb4ba](https://github.com/simontonsoftware/s-libs/commit/c2bb4bac0e4c3f146196091b6b30f5f9a11dd23f)), closes [#88](https://github.com/simontonsoftware/s-libs/issues/88)
- **ng-mat-core:** add helpers to set up complex themes easily ([0879e43](https://github.com/simontonsoftware/s-libs/commit/0879e4351bc9da23af4817c7657146f090d1caab))

### Bug Fixes

- **ng-dev:** `AngularContext` cleans up after itself better in error situations, to avoid all future tests failing "There is already another AngularContext in use (or it was not cleaned up)" ([81cbd5c](https://github.com/simontonsoftware/s-libs/commit/81cbd5c43344bfaf17c51106bf66d08353ad7ee0)), closes [#98](https://github.com/simontonsoftware/s-libs/issues/98)

## [15.0.0](https://github.com/simontonsoftware/s-libs/compare/v15.0.0-next.0...v15.0.0) (2022-12-05)

## [15.0.0-next.0](https://github.com/simontonsoftware/s-libs/compare/v14.1.0...v15.0.0-next.0) (2022-11-24)

### ⚠ BREAKING CHANGES

- **ng-core:** Descendants of `DirectiveSuperclass` must no longer pass `injector` in `super(injector)`
- **ng-core:** Removed the protected instance variable `DirectiveSuperclass.changeDetectorRef`. If you are using it, you'll need to inject it yourself.
- Libraries that depend on them now require Angular 15 and Jasmine 4.5

### Features

- **ng-core:** `DirectiveSuperclass` and its descendants no longer require passing `Injector` to their constructors ([a439a43](https://github.com/simontonsoftware/s-libs/commit/a439a4395476d6c2a55403b4b18b0967c453c524))
- Upgrade to Angular 15 ([81e664a](https://github.com/simontonsoftware/s-libs/commit/81e664a307fbfbc605963850eea1a6595289c4d9))

### Bug Fixes

- **ng-core:** `WrappedControlSuperclass` was failing to synchronize validations with its parent when bound using `formControlName` ([0afc421](https://github.com/simontonsoftware/s-libs/commit/0afc421d5e86e6ef2aa4ee43a2252bb04a60b17b)), closes [#82](https://github.com/simontonsoftware/s-libs/issues/82)

## [14.1.0](https://github.com/simontonsoftware/s-libs/compare/v14.0.0...v14.1.0) (2022-08-26)

### Features

- **js-core:** `sleep()` now accepts a unit of time ([cd3ac16](https://github.com/simontonsoftware/s-libs/commit/cd3ac161d1e5e0a98510ea5fa4e336f0d628c5c4))
- **js-core:** add `sort()` ([94d255a](https://github.com/simontonsoftware/s-libs/commit/94d255a3fa25c57b97b616096d700f40b788b35d))
- **micro-dash:** accept nullish values for `size()` ([71eaf0b](https://github.com/simontonsoftware/s-libs/commit/71eaf0be25f732c9cbebeb839287d3d2dadc375d))
- **ng-dev:** `ComponentContext` will now run `APP_INITIALIZER`s before instantiating your component. This requires all work in your initializers to complete with a call to `tick()`. ([4f5a0a2](https://github.com/simontonsoftware/s-libs/commit/4f5a0a288f523c8b9cce387430431ef1e8aac63e))
- **rxjs-core:** add `debounceMap()` ([b6bc9bb](https://github.com/simontonsoftware/s-libs/commit/b6bc9bb75627bbbb2f7675a4f63d59c9988bd92c))

### Bug Fixes

- **micro-dash:** fix typing for `omit()` with a nullish object ([4a343c3](https://github.com/simontonsoftware/s-libs/commit/4a343c3190163517fae5c547b24afe2101a9ec2a)), closes [#78](https://github.com/simontonsoftware/s-libs/issues/78)

## [14.0.0](https://github.com/simontonsoftware/s-libs/compare/v14.0.0-next.0...v14.0.0) (2022-06-24)

## [14.0.0-next.0](https://github.com/simontonsoftware/s-libs/compare/v13.1.0...v14.0.0-next.0) (2022-06-11)

### ⚠ BREAKING CHANGES

- Libraries that depend on Angular now require version 14, that depend on RxJS require 7.5, and that require Jasmine require 4.1
- **ng-core:** Subclasses that override one of these methods must make the same name change.
- **ng-core:** Errors from validation outside and inside a `WrappedControlSuperclass` are now synchronized both ways. See the docs for examples to modify or disable this process.

### Features

- **ng-core:** `WrappedControlSuperclass` now synchronizes validation errors with its outer `NgControl`, if one exists ([edea7d4](https://github.com/simontonsoftware/s-libs/commit/edea7d499db7614bb5768b47d014226199efb4a2)), closes [#76](https://github.com/simontonsoftware/s-libs/issues/76)
- **ng-core:** Rename `WrappedControlSuperclass.outerToInner` and similar to `.outerToInnerValues` and similar, to avoid confusion with `.outerToInnerErrors` ([b65e4e2](https://github.com/simontonsoftware/s-libs/commit/b65e4e2c8739c29d833fdf070e8b9a632940cc8b))
- **ng-dev:** add `ComponentHarnessSuperclass` ([861a4a4](https://github.com/simontonsoftware/s-libs/commit/861a4a475584fe3953876d5dd6460157a00e5b71))
- **rxjs-core:** improve typing for `withHistory()` ([c4134ff](https://github.com/simontonsoftware/s-libs/commit/c4134ff0300c799f68c7bb929ea52aab5f43529e)), closes [#5](https://github.com/simontonsoftware/s-libs/issues/5)
- Update to Angular 14 ([ea35470](https://github.com/simontonsoftware/s-libs/commit/ea35470b842dfe5796226eb63417c77f439f5845))

## [13.1.0](https://github.com/simontonsoftware/s-libs/compare/v13.1.0-next.2...v13.1.0) (2021-12-29)

### Features

- **app-state:** add `PersistentStore` ([f85fc6f](https://github.com/simontonsoftware/s-libs/commit/f85fc6f7ddfaac8550f0a958c526cec79996b66c))
- **app-state:** add `codec` param to `PersistentStore` ([5a008f7](https://github.com/simontonsoftware/s-libs/commit/5a008f750b6cb58f5467c740779e86d6a21d50a9))
- **js-core:** Add `PublicInterface` ([e443610](https://github.com/simontonsoftware/s-libs/commit/e443610040d07769aff402b665f542974a10d1aa)), closes [#65](https://github.com/simontonsoftware/s-libs/issues/65)
- **ng-app-state:** `nasModel`'s `disabled` input accepts `null`, for compatibility with an async pipe ([d3cebcd](https://github.com/simontonsoftware/s-libs/commit/d3cebcde5576807b66bed80adbb9f47e2d30ab15)), closes [#69](https://github.com/simontonsoftware/s-libs/issues/69)
- **ng-dev:** add `staticTest()` ([e3ca8a2](https://github.com/simontonsoftware/s-libs/commit/e3ca8a2b83e399d43dfa9dac2cd5539fd4fe6065))

## [13.1.0-next.2](https://github.com/simontonsoftware/s-libs/compare/v13.1.0-next.1...v13.1.0-next.2) (2021-12-18)

### Features

- **ng-mat-core:** Add `SlDialogHarness` ([2478777](https://github.com/simontonsoftware/s-libs/commit/24787771bbf8454e415e189ae5ee18bca765f420))

## [13.1.0-next.1](https://github.com/simontonsoftware/s-libs/compare/v13.1.0-next.0...v13.1.0-next.1) (2021-12-18)

### Bug Fixes

- **ng-mat-core:** properly export `SlDialogService` ([68d3963](https://github.com/simontonsoftware/s-libs/commit/68d3963247a1aff82656ecfd3612976ad4106750))

## [13.1.0-next.0](https://github.com/simontonsoftware/s-libs/compare/v13.0.0...v13.1.0-next.0) (2021-12-18)

### Features

- **js-core:** add `Stopwatch` ([2704c53](https://github.com/simontonsoftware/s-libs/commit/2704c532b82cff1882eb7648668489f8ffe6350e))
- **micro-dash:** add `mapKeys()` ([f29016a](https://github.com/simontonsoftware/s-libs/commit/f29016a031e1c395642fbbd2e9e1375e662a1a71))
- **ng-dev:** add `AngularContext.hasHarness()` ([464a9b9](https://github.com/simontonsoftware/s-libs/commit/464a9b9c17b6e469bd48a11478a90309d85e8f69))
- **ng-mat-core:** Introducing `@s-libs/ng-mat-core`! A library of utility for Angular Material. The first thing available: `SlDialogService` ([#71](https://github.com/simontonsoftware/s-libs/issues/71)) ([91de8e6](https://github.com/simontonsoftware/s-libs/commit/91de8e69196aa62876e0e0549f8ab04ac2e0f13b))

### Bug Fixes

- **js-core:** improve accuracy of `elapsedToString()` when computing both very large and very small units. (It is now accurate until the largest unit is about a quadrillion times the size of the smallest unit.) ([fa072cd](https://github.com/simontonsoftware/s-libs/commit/fa072cd4e304d0f125eb77c5526bbf9d40746c36))

## [13.0.0](https://github.com/simontonsoftware/s-libs/compare/v13.0.0-next.0...v13.0.0) (2021-11-20)

### Bug Fixes

- **ng-dev:** properly export `expectRequest` and `SlTestRequest` ([9c64fdd](https://github.com/simontonsoftware/s-libs/commit/9c64fdd290007f0ee8e438a831ee8126a4b2b4d4))

## [13.0.0-next.0](https://github.com/simontonsoftware/s-libs/compare/v12.0.0...v13.0.0-next.0) (2021-11-20)

### ⚠ BREAKING CHANGES

- **all libraries:** UMD bundles are no longer published, because the Angular CLI no longer creates them.
- **ng-core:** In subclasses of `WrappedFormControlSuperclass`, rename all references of `formControl` to `control`
- **ng-core:** If you have a subclass of `WrappedFormControlSuperclass` that implement `ngOnInit()`, you must now call `super.ngOnInit()`
- **ng-core:** Rename all references of `FormControlSuperclass` to `FormComponentSuperclass`
- **ng-dev:** In a previous version, linting config moved from `ng-dev` to `eslint-config-ng`. The old config was deprecated, now it is removed.
- **ng-dev:** Tests that cause a call to `ErrorHandler.handleError` will now fail. Expect the errors with something like `ctx.inject(MockErrorHandler).expectOne('error message')`.
- **ng-dev:** `trimLeftoverStyles()` has been removed, because Angular does it now by default.
- **ng-dev:** The deprecated `precompileForTests()` was removed from the library. It was only useful for the old View Engine renderer.
- **ng-dev:** The behavior for `AsyncMethodController` to automatically trigger promise handlers and change detection is now opt-out instead of opt-in. The `ctx` option for its constructor has been removed. If you are using an `AngularContext` and do _not_ want automatic calls to `.tick()` after each `.flush()` and `.error()`, pass a new option the constructor: `autoTick: false`.
- **ng-dev:** To track which context is "current", it is now an error to create a context object without later calling its `.run()` method.
- **ng-dev:** To track which context is "current", it is now required for context subclasses to call `super.cleanUp()`.

### Features

- Upgrade peer dependencies to RxJs 7.4, Angular 13, and Jasmine 3.10 ([b030aa1](https://github.com/simontonsoftware/s-libs/commit/b030aa1380dc6204a4ba2299008639c3dfb11d0d))
- **app-state:** improve error message when trying to `.assign()` to undefined state. ([ad11531](https://github.com/simontonsoftware/s-libs/commit/ad11531439e5113172e9272a10d103dc87bc620a)), closes [#53](https://github.com/simontonsoftware/s-libs/issues/53)
- **js-core:** Improve typing of `mapToObject()` for index types ([4310429](https://github.com/simontonsoftware/s-libs/commit/431042908c473765ebe1a155f7501220fc82bfae)), closes [#54](https://github.com/simontonsoftware/s-libs/issues/54)
- **micro-dash:** add `intersection()` ([1c9a715](https://github.com/simontonsoftware/s-libs/commit/1c9a71570c674867769e69aa0c78f748c8557f15)), closes [#48](https://github.com/simontonsoftware/s-libs/issues/48)
- **micro-dash:** add `partition()` ([14417df](https://github.com/simontonsoftware/s-libs/commit/14417df4b4087de86e5f62c2874cb4f3fdf32823)), closes [#25](https://github.com/simontonsoftware/s-libs/issues/25)
- **micro-dash:** add `property()` ([52a3c02](https://github.com/simontonsoftware/s-libs/commit/52a3c021490fca0b0ed4b42b4bb0c010e9babb83))
- **ng-app-state:** `nasModel` accepts `null` for the store, for compatibility with an async pipe ([f5f8f7a](https://github.com/simontonsoftware/s-libs/commit/f5f8f7aafd3eb3ad319b2019431563360dc7c81a)), closes [#60](https://github.com/simontonsoftware/s-libs/issues/60)
- **ng-core:** add `WrappedControlSuperclass` ([fb7cc7e](https://github.com/simontonsoftware/s-libs/commit/fb7cc7eb9fd052c49bf9132c0f8e40d45f7092b8))
- **ng-core:** No longer require unnecessary-looking constructors when extending `WrappedControlSuperclass` ([337eaa3](https://github.com/simontonsoftware/s-libs/commit/337eaa30e2dc05fec35c0bc0a3350d188c188031))
- **ng-core:** Rename `FormControlSuperclass` to `FormComponentSuperclass`, to better match Angular terminology (where a "FormControl" is not a component) ([481908d](https://github.com/simontonsoftware/s-libs/commit/481908d6cbafc5d282edbe250eb2c1de791f42c8))
- **ng-dev:** `AngularContext` now uses `MockErrorHandler`. ([71f0c44](https://github.com/simontonsoftware/s-libs/commit/71f0c445f3a2061f1eafac52809ec05ec5a9e33c))
- **ng-dev:** `AsyncMethodController` no longer needs the `ctx` argument ([3c2f190](https://github.com/simontonsoftware/s-libs/commit/3c2f19020c889351be0cd28c220b855ddd850801))
- **ng-dev:** `ComponentContext` no longer clears styles between tests that were added by anyone other than angular. (This is desirable when using e.g. Ionic or Fontawesome, which expect styles to persist.) ([b42af81](https://github.com/simontonsoftware/s-libs/commit/b42af8178f78ed5a7ddd8c23989a9720ff6d052e)), closes [#34](https://github.com/simontonsoftware/s-libs/issues/34)
- **ng-dev:** add `AngularContext.getCurrent()` ([0c0acfc](https://github.com/simontonsoftware/s-libs/commit/0c0acfc6183311eb617094e9c4d54122d97afd94))
- **ng-dev:** add `expectRequest()` and `SlTestRequest` ([115b757](https://github.com/simontonsoftware/s-libs/commit/115b7570c25fae9948a86a5fd8d1d1f52bcad094))
- **ng-dev:** add `MockErrorHandler` ([d83353e](https://github.com/simontonsoftware/s-libs/commit/d83353e872cd959ff7a9c9b0999ed9a9b67d0e99))
- **ng-dev:** provide a nice error message why trying to use `AngularContext.tick()` outside `.run()` ([396af3c](https://github.com/simontonsoftware/s-libs/commit/396af3c31a73ac37426b3bf6a3fab84eba32c588)), closes [#29](https://github.com/simontonsoftware/s-libs/issues/29)
- **ng-dev:** remove deprecated linting config ([5b4aefe](https://github.com/simontonsoftware/s-libs/commit/5b4aefed45cd73c365d8f566885574b396482ad4))

### Bug Fixes

- **js-core:** Fix typing to show that `Persistence.get()` can return `undefined` ([50239e5](https://github.com/simontonsoftware/s-libs/commit/50239e54d9f6b6a20f49e95a26a3ab0934eb099c)), closes [#56](https://github.com/simontonsoftware/s-libs/issues/56)
- **micro-dash:** `flatten()` and `flatMap()` now work on very large arrays ([5c215da](https://github.com/simontonsoftware/s-libs/commit/5c215daba189095efc941a517a9158ddab33a17c)), closes [#46](https://github.com/simontonsoftware/s-libs/issues/46)
- **ng-core:** `WrappedControlSuperclass` gracefully handles errors thrown from `innerToOuter()` and `outerToInner()` ([45599aa](https://github.com/simontonsoftware/s-libs/commit/45599aaef8c8283cfb03ed54f4460d8202a0fcf0))
- **ng-core:** Fix a timing issue when combining `nasModel` and `WrappedControlSuperclass` so that it properly receives its initial value ([6e07405](https://github.com/simontonsoftware/s-libs/commit/6e0740568868c329116b9fd2117e1e9ccc3a0702))
- **ng-dev:** fix compilation error in CI ([2ff1d2c](https://github.com/simontonsoftware/s-libs/commit/2ff1d2cb86edf4223b231ca440da644c300be4af))

## [12.0.0](https://github.com/simontonsoftware/s-libs/compare/v12.0.0-next.1...v12.0.0) (2021-05-26)

### Features

- **js-core:** Typing for `MigrateFunction` and `VersionedObject` are available from the package root ([4e50072](https://github.com/simontonsoftware/s-libs/commit/4e500720f3fea00fd2707cf5fddf986bd63459c1))

## [12.0.0-next.1](https://github.com/simontonsoftware/s-libs/compare/v12.0.0-next.0...v12.0.0-next.1) (2021-05-23)

### Bug Fixes

- **eslint-config-ng:** Extract eslint config to a new project. Allows using it in a JSON config file ([cb84b1b](https://github.com/simontonsoftware/s-libs/commit/cb84b1b592442e4539b705f5db9735195a93c631))

## [12.0.0-next.0](https://github.com/simontonsoftware/s-libs/compare/v11.3.0...v12.0.0-next.0) (2021-05-18)

### ⚠ BREAKING CHANGES

- **ng-dev:** Linting config is now provided by [`@s-libs/eslint-config-ng`](https://github.com/simontonsoftware/s-libs/tree/master/projects/eslint-config-ng). The old TSLint and ESLint configs are still available in `ng-dev`, but are deprecated. ESLint is no longer installed automatically with `ng-dev`, so to continue using its deprecated config you'll need to install the old dependencies via your own `package.json`. They were: `"@typescript-eslint/eslint-plugin": "^4.8.0"`, `"@typescript-eslint/parser": "^4.6.0"`, and `"eslint": "^7.14.0"`. Consult the [README for eslint-config-ng](https://github.com/simontonsoftware/s-libs/tree/master/projects/eslint-config-ng) to to switch to the new configs. The old ones will be removed from this library in a future version.
- all 3rd party dependencies require bumped version numbers
- **ng-core:** `AngularContextNext` and `ComponentContextNext` are renamed to replace their old, deprecated versions. If you are still using the old ones, switch to the "Next" versions and get your tests passing before upgrading to `@s-libs` version 12. Once you are on the "Next" versions, this upgrade only requires removing "Next" from the ends of their names.

### Features

- **ng-dev:** Migrate from deprecated TSLint config to new ESLint config ([acd734c](https://github.com/simontonsoftware/s-libs/commit/acd734c060b2a1b9fa85865441c21d876a0a1d94))
- Update to Angular 12 ([d527860](https://github.com/simontonsoftware/s-libs/commit/d527860acb277cb0ca101d636c623a79dad3b254))
- **micro-dash:** add `reject()` ([915db96](https://github.com/simontonsoftware/s-libs/commit/915db9636191df5683a0aa83f7c601a94c17a8f6)), closes [#33](https://github.com/simontonsoftware/s-libs/issues/33)
- **ng-core:** add `WrappedFormControlSuperclass.setUpInnerToOuter$()` and `.setUpOuterToInner$` ([6c90588](https://github.com/simontonsoftware/s-libs/commit/6c905883003829c0626b97c579acbe282dd6f15b)), closes [#37](https://github.com/simontonsoftware/s-libs/issues/37)
- **ng-core:** Remove deprecated APIs ([106962f](https://github.com/simontonsoftware/s-libs/commit/106962f70cc6ff267d3ee4f9a1f8c3960a1ffeed))
- **ng-core:** WrappedFormControlSuperclass now sets `ng-touched` on the inner form control ([ad1a474](https://github.com/simontonsoftware/s-libs/commit/ad1a474a918dc67d9d207bcb6bfe86cc9253b471)), closes [#38](https://github.com/simontonsoftware/s-libs/issues/38)

### Bug Fixes

- **ng-dev:** `ComponentContextNext` now handles inputs that come from a component's superclass ([f7830e6](https://github.com/simontonsoftware/s-libs/commit/f7830e6e93aa8b1d480f69206bf7266216681cdc)), closes [#40](https://github.com/simontonsoftware/s-libs/issues/40)

## [11.3.0](https://github.com/simontonsoftware/s-libs/compare/v11.2.1...v11.3.0) (2021-03-13)

### Features

- **micro-dash:** add `negate()` ([1056836](https://github.com/simontonsoftware/s-libs/commit/1056836fac5428601e76ebcf6f58ff3ca530e821)), closes [#26](https://github.com/simontonsoftware/s-libs/issues/26)
- **micro-dash:** improve typing of `forEach` ([74dbdbf](https://github.com/simontonsoftware/s-libs/commit/74dbdbf7428bb3501b830f4eb649a58d5c796c35)), closes [#22](https://github.com/simontonsoftware/s-libs/issues/22)
- **ng-dev:** remove the ESLint rule `max-statements`. It did not lead to better code. ([339ab7f](https://github.com/simontonsoftware/s-libs/commit/339ab7f201872aa9113f838f3d23827ced0fbeea))
- **rxjs-core:** add `keepWakeLock$()` ([4a58461](https://github.com/simontonsoftware/s-libs/commit/4a5846167108031d3f0249f970ae692b0ca8dd06))
- **rxjs-core:** add `SubscriptionManager.manage()` ([4b1aad6](https://github.com/simontonsoftware/s-libs/commit/4b1aad6379411a6d52c85b65a6edecca19bc7bb4))

### [11.2.1](https://github.com/simontonsoftware/s-libs/compare/v11.2.0...v11.2.1) (2021-01-07)

### Bug Fixes

- **ng-core:** Fix for "Types of property 'ɵfac' are incompatible." ([06f89f9](https://github.com/simontonsoftware/s-libs/commit/06f89f9ba30544b1f3d913bbee9c37bb6072580e))

## [11.2.0](https://github.com/simontonsoftware/s-libs/compare/v11.2.0-next.2...v11.2.0) (2021-01-07)

### Features

- **micro-dash:** improve typing of `reduce()` and `reduceRight()` ([6c5500d](https://github.com/simontonsoftware/s-libs/commit/6c5500d44116c5a866188904473d15f0c9be527b)), closes [#20](https://github.com/simontonsoftware/s-libs/issues/20)
- **ng-dev:** `AngularContext` flushes pending timeouts automatically at the end of each test (instead of throwing the error "X timer(s) still in the queue.") ([33d890a](https://github.com/simontonsoftware/s-libs/commit/33d890a8260dc91e2e7392bd1a8dcfee50c946a7)), closes [#21](https://github.com/simontonsoftware/s-libs/issues/21)

### Bug Fixes

- **js-core:** no longer throw error when `localStorage` is not available ([06be1e5](https://github.com/simontonsoftware/s-libs/commit/06be1e531c277896b04031503bbec5ad71212bd3)), closes [#17](https://github.com/simontonsoftware/s-libs/issues/17)
- **ng-core:** `DirectiveSuperclass.getInput$()` emits synchronously if `.ngOnChanges()` was already called ([466415c](https://github.com/simontonsoftware/s-libs/commit/466415c990f8b40c02eea40c3018b4afe1762d03))

## [11.2.0-next.2](https://github.com/simontonsoftware/s-libs/compare/v11.2.0-next.1...v11.2.0-next.2) (2021-01-05)

### Features

- **ng-dev:** `ComponentContextNext` runs async tests and uses normal async component harnesses. Deprecate `AngularContext` in favor of the new `AngularContextNext` (which powers some of this new behavior). ([07cecef](https://github.com/simontonsoftware/s-libs/commit/07cecef9af41dfecb5787d403ce1a50973b94acf))
- **ng-dev:** added `ComponentContextNext.assignWrapperStyles()` ([b3fc051](https://github.com/simontonsoftware/s-libs/commit/b3fc051a6b6b0fa9d142fe4a7abae029cb166ddc))

## [11.2.0-next.1](https://github.com/simontonsoftware/s-libs/compare/v11.2.0-next.0...v11.2.0-next.1) (2021-01-01)

### Features

- **ng-core:** `DirectiveSuperclass.getInput$()` wait until the input is set before emitting. Before, if called e.g. from the directive's constructor, it would emit `undefined` immediately, then emit again during `ngOnChanges`. **Caveat:** all emissions are now delayed on the microtask queue. ([3b13611](https://github.com/simontonsoftware/s-libs/commit/3b13611044b28c9a00d07b0e73210831659f7f6d)), closes [#14](https://github.com/simontonsoftware/s-libs/issues/14)
- **ng-dev:** add `ComponentContextNext`. This will replace `ComponentContext` in a future major version release. See migration notes in the class-level docs for `ComponentContext`. Closes [#15](https://github.com/simontonsoftware/s-libs/issues/15). ([90bc99f](https://github.com/simontonsoftware/s-libs/commit/90bc99f72995bd757e02eda7ec2bf3e51751c7d4))

## [11.2.0-next.0](https://github.com/simontonsoftware/s-libs/compare/v11.1.0...v11.2.0-next.0) (2020-12-19)

### Features

- **js-core:** add `isFalsy()` ([62bd6da](https://github.com/simontonsoftware/s-libs/commit/62bd6da2905ba7e505da5d82bec658ed47475b36))
- **js-core:** add `isTruthy()` ([ca38c5d](https://github.com/simontonsoftware/s-libs/commit/ca38c5d324cb867e6ad613cd09267ca1bd4ecaf6))
- **micro-dash:** add `nth()` ([61a37b1](https://github.com/simontonsoftware/s-libs/commit/61a37b15cd1e7c0a806309691b4b86363d5d2cfb)), closes [#10](https://github.com/simontonsoftware/s-libs/issues/10)
- **micro-dash:** add `sampleSize()` ([05bf741](https://github.com/simontonsoftware/s-libs/commit/05bf741365d897352c8469161ec1ab39fe4eb48f))
- **micro-dash:** add `shuffle()` ([5e6f51a](https://github.com/simontonsoftware/s-libs/commit/5e6f51a466885c241cfecdf1b7dfbe90cdfd8914))
- **ng-dev:** add `AsyncMethodController` ([a8eb567](https://github.com/simontonsoftware/s-libs/commit/a8eb56794ca818da2c9ca0e567b0a5d06e46ef6e)), closes [#9](https://github.com/simontonsoftware/s-libs/issues/9)

## [11.1.0](https://github.com/simontonsoftware/s-libs/compare/v11.0.0...v11.1.0) (2020-11-27)

### Features

- **app-state:** `spreadArrayStore$()` handles null and undefined ([16e0dce](https://github.com/simontonsoftware/s-libs/commit/16e0dcedf16f3c0d80f0d98b984b2c29ab798c28)), closes [#4](https://github.com/simontonsoftware/s-libs/issues/4)
- **app-state:** `spreadObjectStore$()` handles null and undefined ([c15b653](https://github.com/simontonsoftware/s-libs/commit/c15b6535ce02ab0d0eeffa4fe98d7e5e0a964ed5))
- **js-core:** add `Constructor` type to support the mixin pattern ([f39a6b9](https://github.com/simontonsoftware/s-libs/commit/f39a6b9acb1df9247e65b3b0340290c3ddac71f7))
- **micro-dash:** improve the typing of `omit()` ([48d267b](https://github.com/simontonsoftware/s-libs/commit/48d267baee14702b74db7815c6888285c77dd77b))
- **micro-dash:** improve the typing of `omitBy()` ([a2c4280](https://github.com/simontonsoftware/s-libs/commit/a2c42808c46ef6fbdac2f0f8bff9f50ed2d8dc6e))
- **micro-dash:** improve the typing of `pick()` ([ecedb2e](https://github.com/simontonsoftware/s-libs/commit/ecedb2e02451fb18ade5888d24e09956754accea))
- **micro-dash:** improve the typing of `pickBy()` ([bcf1824](https://github.com/simontonsoftware/s-libs/commit/bcf18241f14e40a7c763d7c21a2f8e3cb93f7e76))
- **micro-dash:** reduce size of `isBoolean()` ([a57466a](https://github.com/simontonsoftware/s-libs/commit/a57466a75612292d33cf44f0ad9d39c5a1ad5a9a))
- **ng-core:** add `mixInInjectableSuperclass()` ([e3cacf8](https://github.com/simontonsoftware/s-libs/commit/e3cacf83c54d370e7fcd5bc0240044cf70a126b6))
- **rxjs-core:** `mapAndCacheArrayElements()` handles null and undefined ([7d19f47](https://github.com/simontonsoftware/s-libs/commit/7d19f477e6a5360541ba478b0aa808c16d323c21))
- **rxjs-core:** `mapAndCacheObjectElements()` handles null and undefined ([7829d6b](https://github.com/simontonsoftware/s-libs/commit/7829d6b810fa5b9091573b5e39bcf79ce82b5cb0))
- **rxjs-core:** add `mixInSubscriptionManager()` ([c173fa5](https://github.com/simontonsoftware/s-libs/commit/c173fa5f56956dc3fb762235fc983722e819a41e))
- add support for all libraries to be consumed as UMD bundles ([8e9bec9](https://github.com/simontonsoftware/s-libs/commit/8e9bec97274418a5eb917fa2c8701e475c68080b)), closes [#7](https://github.com/simontonsoftware/s-libs/issues/7)

## [11.0.0](https://github.com/simontonsoftware/s-libs/compare/v11.0.0-next.0...v11.0.0) (2020-11-23)

### Bug Fixes

- **ng-core:** DirectiveSuperclass can now be used for a pipe ([7fcd056](https://github.com/simontonsoftware/s-libs/commit/7fcd05651807d38f3d9d20727cdabb1a63b1c377))

## [11.0.0-next.0](https://github.com/simontonsoftware/s-libs/compare/v10.0.0...v11.0.0-next.0) (2020-11-21)

### ⚠ BREAKING CHANGES

- `ng-core` and `ng-app-state`, and `ng-dev` now require angular 11

### Features

- Update dependenices ([45eb28e](https://github.com/simontonsoftware/s-libs/commit/45eb28e26273110b21c7af6255986cb5d0b5e44f))

## [10.0.0](https://github.com/simontonsoftware/s-libs/compare/v0.3.3...v10.0.0) (2020-11-21)

### Features

- **app-state:** improve performance when unsubscribing ([6bdd873](https://github.com/simontonsoftware/s-libs/commit/6bdd873bcde607a64e21d7c8d3ff00358fa766fb))

### [0.3.3](https://github.com/simontonsoftware/s-libs/compare/v0.3.2...v0.3.3) (2020-11-14)

### Features

- **micro-dash:** reduce size of `functions()` ([e9efb9f](https://github.com/simontonsoftware/s-libs/commit/e9efb9fd4a6362279f96a433c09d1c7604ce5247))

### Bug Fixes

- **micro-dash:** `functions()` no longer calls getters ([145f301](https://github.com/simontonsoftware/s-libs/commit/145f301132c6a500bcf7b03e4428f106059a80a6))

### [0.3.2](https://github.com/simontonsoftware/s-libs/compare/v0.3.1...v0.3.2) (2020-11-13)

### Features

- **ng-dev:** `AngularContext.tick()` better simulates real change detection ([68fc5da](https://github.com/simontonsoftware/s-libs/commit/68fc5da74b0f96949013c1aef60eb07db39fb2ee))

### [0.3.1](https://github.com/simontonsoftware/s-libs/compare/v0.3.0...v0.3.1) (2020-11-13)

### Features

- **ng-dev:** `AngularContext` mocks performance.now ([0ae92d6](https://github.com/simontonsoftware/s-libs/commit/0ae92d69881ca360a749f7122135c62c60a04ec9))

## [0.3.0](https://github.com/simontonsoftware/s-libs/compare/v0.2.0...v0.3.0) (2020-11-12)

### ⚠ BREAKING CHANGES

- **ng-dev:** requires @angular/cdk as a peer dependency

### Features

- **js-core:** add `isPromiseLike()` ([7cfec64](https://github.com/simontonsoftware/s-libs/commit/7cfec648954d834fa02dc2676e2c87fcba4b534b))
- **micro-dash:** add `isObject()` ([6495ec3](https://github.com/simontonsoftware/s-libs/commit/6495ec329487a30d9b7a84e0a2516eae93c956e1))
- **ng-dev:** `AngularContext` supports component harnesses with fakeAsync ([97a0fb9](https://github.com/simontonsoftware/s-libs/commit/97a0fb9ced6e0d16ca3f4473ffad4d01f39e0a63))

## [0.2.0](https://github.com/simontonsoftware/s-libs/compare/v0.1.0...v0.2.0) (2020-11-11)

### ⚠ BREAKING CHANGES

- **app-state:** `.batch()` in now only available on `RootStore`. There is a new `Store.getRootStore()` to get a reference to it if needed.

### Features

- **app-state:** Batch API better reflects its semantics ([56214c6](https://github.com/simontonsoftware/s-libs/commit/56214c60f984441bd546de162538c86f662fb898))

## [0.1.0](https://github.com/simontonsoftware/s-libs/compare/v0.0.7...v0.1.0) (2020-11-09)

### ⚠ BREAKING CHANGES

- requires libraries scaffolded by Angular 10.2

### Bug Fixes

- support the latest Angular CLI scaffolding ([900876d](https://github.com/simontonsoftware/s-libs/commit/900876d033826f5b155688e296c028df672838c0))

### [0.0.7](https://github.com/simontonsoftware/s-libs/compare/v0.0.6...v0.0.7) (2020-11-02)

### Bug Fixes

- **app-state:** unsubscribing mid-emit could sometimes result in an error ([c42585f](https://github.com/simontonsoftware/s-libs/commit/c42585f0c26f6f90b4196d010e01602f545d3fd7))

### [0.0.6](https://github.com/simontonsoftware/s-libs/compare/v0.0.5...v0.0.6) (2020-11-01)

### Features

- include a copy of redux types, so its not a required dependency ([0d567fc](https://github.com/simontonsoftware/s-libs/commit/0d567fc8c38cb63f0162d3f72130bfd812b134bd))

### [0.0.5](https://github.com/simontonsoftware/s-libs/compare/v0.0.4...v0.0.5) (2020-11-01)

### Bug Fixes

- change internal import paths to match how they will be used externally ([1020f8f](https://github.com/simontonsoftware/s-libs/commit/1020f8f270c0cabb4376cc001ebdb2e3430772dd))

### 0.0.4 (2020-11-01)
