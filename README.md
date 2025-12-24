# @kimzuni/templify

[![CI](https://github.com/kimzuni-labs/templify/actions/workflows/ci.yml/badge.svg)](https://github.com/kimzuni-labs/templify/actions/workflows/ci.yml)
[![Publish](https://github.com/kimzuni-labs/templify/actions/workflows/publish.yml/badge.svg)](https://github.com/kimzuni-labs/templify/actions/workflows/publish.yml)
[![NPM version](https://img.shields.io/npm/v/@kimzuni/templify.svg)](https://www.npmjs.com/package/@kimzuni/templify)
[![codecov](https://codecov.io/gh/kimzuni-labs/templify/graph/badge.svg?token=932ALHWG7H)](https://codecov.io/gh/kimzuni-labs/templify)

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
const { keys, matches, groups, render } = require("@kimzuni/templify");

const template = "{key1} {key1 } { key2} {key1}";
const data = { key1: "value1", key3: "value3" };

console.log(keys(template));
// ["key1", "key2"]

console.log(matches(template));
// ["{key1}", "{key1 }", "{ key2}"]

console.log(groups(template));
/*
{
	key1: ["{key1}", "{key1 }"],
	key2: ["{ key2}"],
}
*/

console.log(render(template, data));
// "value1 value1 { key2} value1"
```

### with array

```javascript
const { render } = require("@kimzuni/templify");

const template = "{0} {1} {2} {1}";
const data = ["item1", "item2"];

console.log( render(template, data) );
// "item1 item2 {2} item2"
```

### with compile

```javascript
const { compile } = require("@kimzuni/templify");

const template = "{key1} {key1 } { key2} {key1}";
const data = { key1: "value1", key3: "value3" };

const c = compile(template);
console.log( c.keys() );
console.log( c.matches() );
console.log( c.groups() );
console.log( c.render(data) );
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
	spacing: -1, // alias for `spacing: { size: -1 }`
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
		size: [1, 3],
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
const template = "{ key } / { key1 } / { key_2 }";
const options = { key: /[a-z0-9]+/ };
const data = { key1: "value1", key_2: "value2" };

console.log(render(template, data, {
	...options,
	fallback: undefined,
}));
// "{ key } / value1 / { key_2 }"

console.log(render(template, data, {
	...options,
	fallback: "x",
}));
// "x / value1 / { key_2 }"

console.log(render(template, data, {
	...options,
	fallback: null,
}));
// "null / value1 / { key_2 }"
```



## Override Options

Options used to override compile options during rendering.

Support Options:

- [fallback](#fallback)

```javascript
const template = "{ key } / { key1 } / { key_2 }";
const options = { key: /[a-z0-9]+/, fallback: "fallback" };
const data = { key1: "value1", key_2: "value2" };

const c = compile(template, options);

console.log( c.render(data) );
// "fallback / value1 / { key_2 }"

console.log( c.render(data, { fallback: undefined }) );
// "{ key } / value1 / { key_2 }"

console.log( c.render(data, { fallback: "x" }) );
// "x / value1 / { key_2 }"

console.log( c.render(data, { fallback: null }) );
// "null / value1 / { key_2 }"
```
