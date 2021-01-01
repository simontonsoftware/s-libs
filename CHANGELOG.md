# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
