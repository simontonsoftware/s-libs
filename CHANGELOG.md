# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
