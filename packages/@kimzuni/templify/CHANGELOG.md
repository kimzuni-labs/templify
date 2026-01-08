# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.1.0](https://github.com/kimzuni-labs/templify/compare/v2.0.0...v2.1.0) (2026-01-08)


### ✨ Features

* add depth option for deep access to context ([#55](https://github.com/kimzuni-labs/templify/issues/55)) ([87e7175](https://github.com/kimzuni-labs/templify/commit/87e717538be4dd7efdafd2cca2577e0da61e4ffe))
* add templify-cli package ([#48](https://github.com/kimzuni-labs/templify/issues/48)) ([9454fb5](https://github.com/kimzuni-labs/templify/commit/9454fb52585250642de00edf3414c512487c1bbd))

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
