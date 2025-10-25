# @kimzuni/templify

[![CI](https://github.com/kimzuni-labs/templify/actions/workflows/ci.yml/badge.svg)](https://github.com/kimzuni-labs/templify/actions/workflows/ci.yml)
[![Release](https://github.com/kimzuni-labs/templify/actions/workflows/release.yml/badge.svg)](https://github.com/kimzuni-labs/templify/actions/workflows/release.yml)
[![NPM version](https://img.shields.io/npm/v/@kimzuni/templify.svg)](https://www.npmjs.com/package/@kimzuni/templify)

Flexible template string processor for JavaScript and TypeScript.

Supports customizable template delimiters, spacing rules, and fallback values.
Supports both ESM and CommonJS.



## Installation

```shell
# npm
npm install @kimzuni/templify

# yarn
yarn add @kimzuni/templify

# bun
bun add @kimzuni/templify
```



## Example

```javascript
const { compile, keys, matches, groups, render } = require("@kimzuni/templify");

const template = "{key1} {key1 } { key2} {key1}";
const options = { key: /\w+/, open: "{", close: "}", spacing: -1, fallback: undefined };
const data = { key1: "value1", key3: "value3" };

const c = compile(template, options);

console.log( c.keys() );
console.log( keys(template, options) );
// ["key1", "key2"]

console.log( c.matches() );
console.log( matches(template, options) );
// ["{key1}", "{key1 }", "{ key2}"]

console.log( c.groups() );
console.log( groups(template, options) );
/*
{
	key1: ["{key1}", "{key1 }"],
	key2: ["{ key2}"],
}
*/

console.log( c.render(data) );
console.log( render(template, data, options) );
// "value1 value1 { key2} value1"
```



## Options

All options are optional.

### key

Regex pattern defining valid characters for placeholder keys.
This controls what is allowed between the opening and closing delimiters.

| Type               | Default value |
|--------------------|---------------|
| `string`, `RegExp` | `/\w+/`       |

```javascript
const options = { key: /[a-z]+/ };
const result = render("{ key } { key1 }", { key: "value", key1: "value1" }, options);
console.log(result); // "value { key1 }"
```

### open/close

Custom delimiters for placeholders.
The `open` string marks the start, and `close` marks the end of a placeholder in the template.

| key   | Type     | Default value |
|-------|----------|---------------|
| open  | `string` | `"{"`         |
| close | `string` | `"}"`         |

```javascript
const options = { open: "{{", close: "}}" };
const result = render("{{ key1 }} { key1 }", { key1: "value1" }, options);
console.log(result); // "value1 { key1 }"
```

### spacing

Controls how whitespace inside placeholders is handled.

| key    | Type                 | Default value |
|--------|----------------------|---------------|
| strict | `boolean`            | `false`       |
| count  | `number`, `number[]` | `-1`          |

```javascript
function run(options) {
	return render(
		"{key1} { key1 } {  key1  } {   key1   } {   key1 }",
		{ key1: "value1" },
		{ spacing: options },
	);
};

console.log( run(-1) ); // "value1 value1 value1 value1 value1"
console.log( run(1) ); // "{key1} value1 {  key1  } {   key1   } {   key1 }"
console.log( run({ count: [1, 3] }) ); // "{key1} value1 {  key1  } value1 value1"
console.log( run({ strict: true, count: [1, 3] }) ); // "{key1} value1 {  key1  } value1 {   key1 }"
```

### fallback

Value to use when a placeholder key is missing in the provided data.
If not set, the placeholder remains unchanged.

| Type                                               | Default value |
|----------------------------------------------------|---------------|
| `string`, `number`, `boolean`, `null`, `undefined` | `undefined`   |

```javascript
function run(options) {
	return render(
		"{key1} { key1 } {  key1  } {   key1   } {   key1 }",
		{ key1: "value1" },
		{ fallback: options },
	);
};

console.log( run() ); // "{key1} value1 {  key1  } {   key1   } {   key1 }"
console.log( run("x") ); // "x value1 x x x"
console.log( run(null) ); // "null value1 null null null"
```
