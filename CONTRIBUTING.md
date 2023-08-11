# Commit messages

Version numbers and the changelog are managed automatically using [Conventional Commits](https://www.conventionalcommits.org/). Please understand it. When possible, provide the scope as the affected library, e.g. `feat(js-core): ...`.

# Upgrading

Library dependencies are generally upgraded twice/year, once after each major Angular release. Upgrade to a `X.0.X` version, to ensure compatibility for users with a `.0` minor version.

1. Run Angular's upgrade schematics
1. Generate a diff using [Angular CLI Diffs](https://github.com/simontonsoftware/angular-cli-diffs) and apply the changes to the relevant libraries.
   - At the time of writing these instructions, the relevant options are `-eslint -lib -mat -noApp -standalone -subApp`. For the root `package.json`
   - The version numbers in the root `package.json` should exactly match.
1. Use `npm outdated` to find remaining libraries to upgrade. Upgrade to the latest version of everything that is not specified by the CLI diffs.
1. Update peer dependencies in `projects/*/package.json`. They should match the versions in the root `package.json`, except change `~` to `^`.

# Deploying

Before deploying, make sure all the tests pass! The run automatically in GitHub actions on each commit. If they are green, you can continue. There are a few WebStorm launch configs to run in order:

1. `docs`
2. `git-publish` -or- `git-publish prerelease`
3. `build-libs`
4. `npm publish` -or- `npm publish prerelease`

The "prerelease" configs are for publishing a "next" version of the libraries.
