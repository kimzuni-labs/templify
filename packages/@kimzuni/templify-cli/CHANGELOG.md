# Changelog

## [3.0.0](https://github.com/kimzuni-labs/templify/compare/cli-v2.0.0...cli-v3.0.0) (2026-08-21)


### ⚠ BREAKING CHANGES

* **cli:** The CLI behavior has been updated to reflect the core package changes:
    - 1. The `--spacing-size` flag now accepts a range (e.g., `1 3`) instead of exact values.
    - 2. The default context depth is now unlimited, which may change how your variables are resolved in the CLI output.
    - 3. The `fields` subcommand has been completely removed. Use the `placeholders` subcommand instead.
* **cli:** The `--spacing-size` option no longer accepts arrays of multiple exact values (e.g., `1,2,4`). Use range syntax like `1:4` instead.

### ✨ Features

* **cli:** redefine `--spacing-size` option syntax for range support ([4e64fd7](https://github.com/kimzuni-labs/templify/commit/4e64fd76374453e861c561d6978eb6956793ea64))


### ♻️ Code Refactoring

* apply safe index access and enable noUncheckedIndexedAccess ([b7bb91e](https://github.com/kimzuni-labs/templify/commit/b7bb91eea7f9288b3c411021a4b642b193b084dd))
* **cli:** migrate to the updated core API ([dacc60d](https://github.com/kimzuni-labs/templify/commit/dacc60d8945f2978f5f6c230f16b4678dffdfec9))
* **cli:** replace manual env parsing with dotenv ([f1f159a](https://github.com/kimzuni-labs/templify/commit/f1f159a11bc08ab912837f6ec3153227cfc28367))
* **cli:** use targeted `.mockRestore()` instead of global `mock.restore()` ([95254e4](https://github.com/kimzuni-labs/templify/commit/95254e4a4e23e5f0d63e3298820b20eda66fd434))

## [2.0.0](https://github.com/kimzuni-labs/templify/compare/cli-v1.1.0...cli-v2.0.0) (2026-02-07)


### ⚠ BREAKING CHANGES

* **cli:** use stdout.write in render to avoid extra newline ([#62](https://github.com/kimzuni-labs/templify/issues/62))

### 🐛 Bug Fixes

* **cli:** use stdout.write in render to avoid extra newline ([#62](https://github.com/kimzuni-labs/templify/issues/62)) ([d43cbcf](https://github.com/kimzuni-labs/templify/commit/d43cbcf7a446613f1c34b856b459fce73cabb92a))
* replace workspace:^ deps for npm publish ([#57](https://github.com/kimzuni-labs/templify/issues/57)) ([749d2ec](https://github.com/kimzuni-labs/templify/commit/749d2ece59c39312877e3392db40146dc33e7f02))

## [1.1.0](https://github.com/kimzuni-labs/templify/compare/cli-v1.0.0...cli-v1.1.0) (2026-01-08)


### ✨ Features

* add depth option for deep access to context ([#55](https://github.com/kimzuni-labs/templify/issues/55)) ([87e7175](https://github.com/kimzuni-labs/templify/commit/87e717538be4dd7efdafd2cca2577e0da61e4ffe))

## 1.0.0 (2026-01-06)


### ✨ Features

* add templify-cli package ([#48](https://github.com/kimzuni-labs/templify/issues/48)) ([9454fb5](https://github.com/kimzuni-labs/templify/commit/9454fb52585250642de00edf3414c512487c1bbd))
