# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0](https://github.com/kimzuni-labs/templify/compare/v2.2.0...v3.0.0) (2026-08-21)


### ⚠ BREAKING CHANGES

* **core:** The default behaviors for key parsing and object traversal have changed.
    - Keys are now parsed deeply by default. Use `KEY_PATTERNS.SHALLOW` for the old behavior.
    - Object properties are now traversed with unlimited depth (`depth: -1`) by default.
* **core:** Direct metadata extraction functions are no longer exported. Use `compile(template).keys` instead.
* **core:** `keys`, `placeholders`, and `groups` are now properties instead of methods. To migrate, remove the parentheses when accessing these values.
* **core:** The `fields` alias is no longer available. Please use `placeholders` instead.
* **core:** The `spacing` array now defines a range and no longer supports more than two elements. Use `[1, 3]` instead of `[1, 2, 3]`.

### ✨ Features

* **core:** enable deep object traversal by default (zero-config) ([7607921](https://github.com/kimzuni-labs/templify/commit/7607921d0f5a0d9b98a129f3ee6af276b904f606))
* **core:** introduce strict runtime validation for options ([58ac81c](https://github.com/kimzuni-labs/templify/commit/58ac81cf201ed829188e76be775f97f1d369fc0a))
* **core:** redefine spacing option to use [min, max] range ([0b68f6f](https://github.com/kimzuni-labs/templify/commit/0b68f6f00b0b2d0f301836db0a1fad2852a0b9da))


### ⚡️ Performance Improvements

* **core:** defer pattern initialization in compile for zero-overhead ([0ed8294](https://github.com/kimzuni-labs/templify/commit/0ed82940b2b1dde3bce3a64a3627ed81481614ba))
* **core:** optimize parseData with single-pass extraction ([b7461be](https://github.com/kimzuni-labs/templify/commit/b7461bebd83a16801a1173ee76bdf7acfc20fce4))
* **core:** optimize path resolution and drop flattenContext ([196e39d](https://github.com/kimzuni-labs/templify/commit/196e39dc2553729206f8d67980c39de2546c4f48))
* **core:** optimize regex matching and callback parameters ([dbacd42](https://github.com/kimzuni-labs/templify/commit/dbacd42e16e93247fe5c3e04f43f1cb29548580c))
* **core:** use direct core functions for one-off operations ([0854650](https://github.com/kimzuni-labs/templify/commit/0854650873f6b2724353570cce0c7a174be994f0))


### ♻️ Code Refactoring

* apply safe index access and enable noUncheckedIndexedAccess ([b7bb91e](https://github.com/kimzuni-labs/templify/commit/b7bb91eea7f9288b3c411021a4b642b193b084dd))
* **core:** convert `KEY_PATTERNS.*` to named export ([88fb327](https://github.com/kimzuni-labs/templify/commit/88fb327e8075e5d933671a95107fbc06f3f19694))
* **core:** convert keys, placeholders, and groups to getter properties ([fbe714c](https://github.com/kimzuni-labs/templify/commit/fbe714cd7663833f43dda2db286ad3ddaeeb4714))
* **core:** remove `fields` alias in favor of `placeholders` ([7e87481](https://github.com/kimzuni-labs/templify/commit/7e87481d334862f00091ada895dd9ed2ebe981d4))
* **core:** remove direct functions `keys`, `placeholders` and `groups` ([9ba7780](https://github.com/kimzuni-labs/templify/commit/9ba7780e5b5c78918c89b5a13ef62c86b7c486bf))

## [2.2.0](https://github.com/kimzuni-labs/templify/compare/v2.1.0...v2.2.0) (2026-04-26)


### ✨ Features

* support browser ([#66](https://github.com/kimzuni-labs/templify/issues/66)) ([0a4c461](https://github.com/kimzuni-labs/templify/commit/0a4c461c49960c8d8945ee8f8633a95febaf2981))

## [2.1.0](https://github.com/kimzuni-labs/templify/compare/v2.0.0...v2.1.0) (2026-01-08)


### ✨ Features

* add depth option for deep access to context ([#55](https://github.com/kimzuni-labs/templify/issues/55)) ([87e7175](https://github.com/kimzuni-labs/templify/commit/87e717538be4dd7efdafd2cca2577e0da61e4ffe))

## [2.0.0](https://github.com/kimzuni-labs/templify/compare/v1.3.0...v2.0.0) (2026-01-05)


### ⚠ BREAKING CHANGES

* **api:** Use placeholders/fields instead of matches.
* **types:** Exported type AllowValue renamed to Primitive
* **types:** Exported type RenderData renamed to Context
* The output file structure has changed due to `unbundle: true`.
* Use a named import (`compile`) instead of a default import.
* `count` is no longer supported. Replace with `size`.

### ✨ Features

* **api:** rename matches to placeholders ([df78800](https://github.com/kimzuni-labs/templify/commit/df788003d70c260b40ee398e71f8e2abb14440de))
* **options:** add strict alias support to spacing options ([db7ece4](https://github.com/kimzuni-labs/templify/commit/db7ece40180fdfb8efecca909c3cae1086834705))
* remove deprecated count option ([8a68613](https://github.com/kimzuni-labs/templify/commit/8a68613dbc2a301a7756a81cd976d270382ae64a))
* **types:** export Keys, Matches, Groups types ([90b836b](https://github.com/kimzuni-labs/templify/commit/90b836b71c767f1d2c1b86c7f78e61d8d9f93fe8))
* **types:** rename exported types ([7502c16](https://github.com/kimzuni-labs/templify/commit/7502c16eec1cfd05b2fad51a4142af7f07a9ac51))


### ♻️ Code Refactoring

* remove default export ([cab52db](https://github.com/kimzuni-labs/templify/commit/cab52db87d37718c17301a73252183e26edee0aa))


### 🏗️ Build System

* enable unbundle mode ([415f862](https://github.com/kimzuni-labs/templify/commit/415f862f425412b00165979a2dd16730ae1be254))

## [1.3.0](https://github.com/kimzuni-labs/templify/compare/v1.2.0...v1.3.0) (2025-12-07)


### ✨ Features

* **options:** support override options ([e1def0d](https://github.com/kimzuni-labs/templify/commit/e1def0de92906af2faceeb3de6e8faeafb752f52))


### 🐛 Bug Fixes

* **tests:** type error ([a959033](https://github.com/kimzuni-labs/templify/commit/a959033aa0b7b86a0993b2405d4681940643473d))

## [1.2.0](https://github.com/kimzuni-labs/templify/compare/v1.1.0...v1.2.0) (2025-12-06)


### ✨ New Features

* **options:** rename count to size ([bf1d860](https://github.com/kimzuni-labs/templify/commit/bf1d860b664637e1994117b74ce2e16981d01777))

## [1.1.0](https://github.com/kimzuni-labs/templify/compare/v1.0.0...v1.1.0) (2025-10-25)


### ✨ Features

* **options:** add custom key pattern option ([f1f1cf8](https://github.com/kimzuni-labs/templify/commit/f1f1cf8a3c377f632fa9d5731c52bd7a69e4a11d))

## 1.0.0 (2025-10-24)


### ✨ Features

* **core:** add main templating functions ([66501ca](https://github.com/kimzuni-labs/templify/commit/66501ca803ab0809c7625dcce0c2a55b699515c4))


### 🔧 Miscellaneous Chores

* **release:** setup standard-version ([ea869c5](https://github.com/kimzuni-labs/templify/commit/ea869c5ea224c40c25f0ab94972a7876ec8e93eb))
* **setup:** init project with bun ([5f2e4b9](https://github.com/kimzuni-labs/templify/commit/5f2e4b9855dccc12152a1fe4b6bd9cdbcdb33538))
