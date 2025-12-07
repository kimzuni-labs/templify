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
const { compile } = require("@kimzuni/templify");

const template = "{key1} {key1 } { key2} {key1}";
const options = { key: /[a-zA-Z0-9_-]+/, open: "{", close: "}", spacing: -1, fallback: undefined };
const data = { key1: "value1", key3: "value3" };

const c = compile(template, options);

console.log( c.keys() );
// ["key1", "key2"]

console.log( c.matches() );
// ["{key1}", "{key1 }", "{ key2}"]

console.log( c.groups() );
/*
{
	key1: ["{key1}", "{key1 }"],
	key2: ["{ key2}"],
}
*/

console.log( c.render(data) );
// "value1 value1 { key2} value1"
```

### with array

```javascript
const { compile } = require("@kimzuni/templify");

const template = "{0} {1} {2} {1}";
const data = ["item1", "item2"];

const c = compile(template);

console.log( c.render(data) );
// "item1 item2 {2} item2"
```

### without compile

```javascript
const { keys, matches, groups, render } = require("@kimzuni/templify");

console.log( keys(template, options) );
console.log( matches(template, options) );
console.log( groups(template, options) );
console.log( render(template, data, options) );
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
const template = "{ key } { key1 }";
const data = { key: "value", key1: "value1" };
const options = { key: /[a-z]+/ };

const result = render(template, data, options);
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
const template = "{{ key1 }} { key1 }";
const data = { key1: "value1" };
const options = { open: "{{", close: "}}" };

const result = render(template, data, options);
console.log(result); // "value1 { key1 }"
```

### spacing

Controls how whitespace inside placeholders is handled.

| key    | Type                 | Default value | Info                                                            |
|--------|----------------------|---------------|-----------------------------------------------------------------|
| strict | `boolean`            | `false`       | Requires the number of spaces on both sides to be exactly equal |
| size   | `number`, `number[]` | `-1`          | Specifies the allowed number of spaces                          |

```javascript
const template = "{key1} { key1 } {  key1  } {   key1   } {   key1 }";
const data = { key1: "value1" };

console.log(render(template, data, {
	spacing: -1,
}));
// "value1 value1 value1 value1 value1"

console.log(render(template, data, {
	spacing: {
		size: -1,
	},
}));
// "value1 value1 value1 value1 value1"

console.log(render(template, data, {
	spacing: {
		size: 1,
	},
}));
// "{key1} value1 {  key1  } {   key1   } {   key1 }"

console.log(render(template, data, {
	spacing: {
		size: [1, 3],
	},
}));
// "{key1} value1 {  key1  } value1 value1"

console.log(render(template, data, {
	spacing: {
		strict: true,
		size: 1,
	},
}));
// "{key1} value1 {  key1  } value1 {   key1 }"
```

### fallback

Value to use when a placeholder key is missing in the provided data.
If not set, the placeholder remains unchanged.

| Type                                               | Default value |
|----------------------------------------------------|---------------|
| `string`, `number`, `boolean`, `null`, `undefined` | `undefined`   |

```javascript
const template = "{key1} { key1 } {  key1  } {   key1   } {   key1 }";
const data = { key1: "value1" };

console.log(render(template, data, {
	fallback: undefined,
}));
// "{key1} value1 {  key1  } {   key1   } {   key1 }"

console.log(render(template, data, {
	fallback: "x",
}));
// "x value1 x x x"

console.log(render(template, data, {
	fallback: null,
}));
// "null value1 null null null"
```



## Override Options

Options used to override compile options during rendering.

Support Options:

- [fallback](#fallback)

```javascript
const { compile } = require("@kimzuni/templify");

const template = "{ key1 }/{ key2 }/{ key3 }";
const options = { fallback: "fallback" };
const data = { key1: "value1", key3: "value3" };

const c = compile(template, options);

console.log( c.render(data) );
// "value1/fallback/value3"

console.log( c.render(data, { fallback: undefined }) );
// "value1/{ key2 }/value3"

console.log( c.render(data, { fallback: "x" }) );
// "value1/x/value3"

console.log( c.render(data, { fallback: null }) );
// "value1/null/value3"
```
