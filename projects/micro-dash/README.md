Micro-dash offers a subset of the functionality found in [lodash](https://github.com/lodash/lodash), with drastically reduced bundle size.

## API Documentation

To quickly see which functions are available, and any difference from Lodash beyond the overarching ones listed below, see the [api documentation](https://simontonsoftware.github.io/s-libs/micro-dash).

## Installation

Install using:

```shell script
npm install @s-libs/micro-dash
```

## Project goals

**The main goals of this project are:**

- Api compatibility with lodash. Not in the sense that each function can do everything that its lodash counterpart can do; most are simplified (see the philosophical differences below). But they have the same names, signatures, and basic functionality.
- Small payload size. Most functions are drastically smaller than their counterpart in lodash. For example, when it is the only function imported, `map` brings `14,219 bytes` from lodash but only `419 bytes` from Microdash. Any function that has "iteratee shorthand" in lodash has a similar difference. Every function's size comparison is provided in its [documentation](https://simontonsoftware.github.io/s-libs/micro-dash).
- Pass all tests from the lodash test suite that are relevant given the differences below.
- Supply build artifacts according to the [Angular Package Format](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs), for an optimal experience using all the common, modern build chains. This does not mean `micro-dash` is designed for Angular - it contains generic utility functions useful in any modern javascript environment. The Angular Package Format is the structure followed by the Angular team, published as a recommendation to improve any support libraries.

**Goals that are _not_ part of this project:**

- Complete feature parity with lodash. This project does not aspire to have a "micro" version of every function in lodash.
- Additional functions that are not part of lodash. While there may be many other handy "utility" functions in the world, they do not belong in this library.

## Differences from lodash

Below are the main differences between the implementations in this library compared to lodash. Other differences, when they exist, are listed in the [documentation](https://simontonsoftware.github.io/s-libs/micro-dash) for each function.

- Only designed to work with primitives, plain objects, and arrays. It is not designed or tested to handle inherited properties, symbol keys, `arguments` objects, primitive objects (e.g. `Object(1)`), Dates, Maps, Sets, etc.
- Makes no special attempt to coerce arguments to the expected type, nor to check the type of arguments. Behavior is undefined in such cases.
- There is no shorthand for "iteratees"; functions that accept one require you to provide an actual function.
- Does not pass the iterated object to iteratee functions. This allows simplifications, e.g. functions like `merge` can be used as an iteratee for `reduce` without being guarded.
- It has no special knowledge of "array like" objects; only actual arrays are treated as arrays.
- Makes no special attempt to treat `0` and `-0` differently.
- String functions are designed for simple cases like variable names. They only treat `[0-9A-Za-z]` as part of words and are not smart about contractions or ordinals (e.g. `I'll` or `1st`).
- A modern environment/buildchain is assumed. E.g. this project uses ES6 functions directly. If you target older browsers/environments, you may need to include polyfills separately. However, it will only use features that _can_ be polyfilled.

## Credits

- **[Lodash](https://github.com/lodash/lodash)** - on which this entire project's API is based, most of its tests, and some of its source.
- **[DefinitelyTyped/lodash](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/lodash)** - on which some of the more complicated type definitions are based.
- **[Angular CLI](https://angular.dev/cli)** - which provides most of the project setup and buildchain for this library.
