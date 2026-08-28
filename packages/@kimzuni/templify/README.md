# @kimzuni/templify

[![NPM version](https://img.shields.io/npm/v/@kimzuni/templify.svg)](https://www.npmjs.com/package/@kimzuni/templify)
[![codecov](https://codecov.io/gh/kimzuni-labs/templify/graph/badge.svg?token=932ALHWG7H&component=templify)](https://codecov.io/gh/kimzuni-labs/templify/tree/main/packages/@kimzuni/templify)

A lightweight, flexible template string processor for JavaScript and TypeScript.

It provides a modular API (`compile`, `render`) optimized for tree-shaking.
You can process template strings with custom rules
for delimiters, whitespace, missing data, and etc.

Supports both ESM and CommonJS.
The CLI is available as [@kimzuni/templify-cli](../templify-cli/README.md).



## Overview

![example.mjs screenshot](images/example.png)



## Playground

> [!NOTE]
> The playground provides only the latest release of each supported major version (v3.x or higher).

<https://labs.kimzuni.com/templify/>



## Installation

```shell
# npm
npm install @kimzuni/templify

# yarn
yarn add @kimzuni/templify

# pnpm
pnpm add @kimzuni/templify

# bun
bun add @kimzuni/templify
```



## Quick Start

Templify provides `compile` for parsing and metadata extraction, and a tree-shaking friendly `render` for instant usage.

```javascript
import { render, compile } from "@kimzuni/templify";

// 1. Instant Rendering (Tree-shaking friendly)
console.log( render("Hello, {name}!", { name: "World" }) );
// Hello, World!

// 2. Core Engine: Parsing & Metadata Extraction
const template = compile("[{level}] {message} (code: {id})");  // lazy evaluation
console.log( template.keys );                                  // parsed and cached
console.log( template.placeholders );                          // from cache
console.log( template.groups );                                // from cache
// [ 'level', 'message', 'id' ]
// [ '{level}', '{message}', '{id}' ]
// { level: [ '{level}' ], message: [ '{message}' ], id: [ '{id}' ] }

// 3. High Flexibility: Custom Rules & Fallback
const customTpl = compile('echo "Running ${{ job }} (by ${{ user }})"', {
	open: "${{",
	close: "}}",
	fallback: "unknown",
});

// Fallback values in case of missing values in context
console.log( customTpl.render({ job: "build-core" }) );
// echo "Running build-core (by unknown)"
```

### With Array

```javascript
import { render } from "@kimzuni/templify";

const context = ["item1", "item2"];
const template = "{0} {1} {2} {1}";

console.log( render(template, context) );
// item1 item2 {2} item2
```

### With Deep Access

```javascript
import { render } from "@kimzuni/templify";

const context = { id: 42, "user.age": 30, config: { theme: ["dark", "light"] } };
const template = "{ id } { user.age } { [user.age] } { config.theme } { config.theme[0] } { config.theme.1 }";

console.log( render(template, context) );
// 42 { user.age } 30 { config.theme } dark light
```

### Without Deep Access

with `key` option

```javascript
import { KEY_PATTERNS, render } from "@kimzuni/templify";

const context = { id: 42, "user.age": 30, config: { theme: ["dark", "light"] } };
const template = "{ id } { user.age } { [user.age] } { config.theme } { config.theme[0] } { config.theme.1 }";
const options = { key: KEY_PATTERNS.SHALLOW };

console.log(render(template, context, options));
// 42 { user.age } { [user.age] } { config.theme } { config.theme[0] } { config.theme.1 }
```

with `depth` option

```javascript
import { render } from "@kimzuni/templify";

const context = { id: 42, "user.age": 30, config: { theme: ["dark", "light"] } };
const template = "{ id } { user.age } { [user.age] } { config.theme } { config.theme[0] } { config.theme.1 }";
const options = { depth: 1 };

console.log(render(template, context, options));
// 42 { user.age } 30 { config.theme } { config.theme[0] } { config.theme.1 }
```

### In Browser

You can use the browser bundle directly via script tag.

```html
<script src="https://unpkg.com/@kimzuni/templify/dist/browser/index.iife.js"></script>
<script>
	const context = {
		admin: { name: "John Doe" },
		users: [{ name: "Jane Smith" }],
	};
	const template = "{ admin.name } / { users[0].name }";

	const result = Templify.render(template, context);

	console.log(result);
	// John Doe / Jane Smith
</script>
```



## Options

All options are optional.

### key

> [!TIP]
> `KEY_PATTERNS` provides a set of predefined patterns that can be used for configuration.

Regex pattern defining valid characters for placeholder keys.
Controls which characters are allowed inside the delimiters.
Any regex flags (e.g., `i`, `g`) are ignored if provided.

| Type               | Default value                       |
|--------------------|-------------------------------------|
| `string`, `RegExp` | `/[\w.[\]]+/` (`KEY_PATTERNS.DEEP`) |

```javascript
import { render } from "@kimzuni/templify";

const context = { author: "John Doe", author2: "Jane Smith" };
const template = "Author: { author } (Co-author: { author2 })";
const options = { key: /[a-z]+/ };

console.log( render(template, context, options) );
// Author: John Doe (Co-author: { author2 })
```

### open/close

Custom delimiters for placeholders.
The `open` string marks the start, and `close` marks the end of a placeholder in the template.

| key   | Type     | Default value |
|-------|----------|---------------|
| open  | `string` | `"{"`         |
| close | `string` | `"}"`         |

```javascript
import { render } from "@kimzuni/templify";

const context = { title: "Templify" };
const template = "{{ title }} { title }";
const options = { open: "{{", close: "}}" };

console.log(render(template, context, options));
// Templify { title }
```

### spacing

Options for controlling the number of spaces inside template placeholders.
Can be provided as a simple value or as a full object.

| key    | Type                                                 | Default value | Info                                                                                                                  |
|--------|------------------------------------------------------|---------------|-----------------------------------------------------------------------------------------------------------------------|
| strict | `boolean`                                            | `false`       | When `true`, placeholders must have the same number of spaces on both sides of the key to be considered a valid match |
| size   | `number` or `[number]`, `[min: number, max: number]` | `-1`          | Allowed range or number of spaces inside placeholder delimiters. Negative value disables space checking               |

```javascript
import { render } from "@kimzuni/templify";

const context = { word: "hello" };
const template = "{word} { word } {  word  } {   word   } {    word    } {   word }";

console.log( render(template, context, { spacing: -1 }) );    // alias for `{ size: -1 }`
// hello hello hello hello hello hello

console.log( render(template, context, { spacing: true }) );  // alias for `{ strict: true }`
// hello hello hello hello hello {   word }

console.log( render(template, context, { spacing: { size: 1 } }) );
// {word} hello {  word  } {   word   } {    word    } {   word }

console.log( render(template, context, { spacing: { size: [1, 3] } }) );
// {word} hello hello hello {    word    } hello

console.log( render(template, context, { spacing: { strict: true, size: [1, 3] } }) );
// {word} hello hello hello {    word    } {   word }

console.log( render(template, context, { spacing: { size: [-1, 1] } }) );  // Same as [0, 1]
// hello hello {  word  } {   word   } {    word    } {   word }
```

### fallback

Fallback value to use when a template key is missing.

- `string`, `number`, `boolean`, and `null` are stringified
- `undefined` is treated as absence: the key is considered missing

| Type                                               | Default value |
|----------------------------------------------------|---------------|
| `string`, `number`, `boolean`, `null`, `undefined` | `undefined`   |

```javascript
import { render } from "@kimzuni/templify";

const context = { author: "John Doe", draft_status: "pending" };
const template = "{ title } / { author } / { draft_status }";
const options = { key: /[a-z0-9]+/ }; // draft_status will be ignored by this regex

console.log( render(template, context, { ...options, fallback: undefined }) );
// { title } / John Doe / { draft_status }

console.log( render(template, context, { ...options, fallback: "N/A" }) );
// N/A / John Doe / { draft_status }

console.log( render(template, context, { ...options, fallback: null }) );
// null / John Doe / { draft_status }
```

### depth

> [!NOTE]
> `depth` refers to the nested level of the **context**,
> not the path length of the **key**.

Maximum depth for resolving nested keys.
Keys deeper than the specified depth are ignored.

| Type     | Default value |
|----------|---------------|
| `number` | `1`           |

```javascript
import { render } from "@kimzuni/templify";

const context = { version: "v1.0.0", tags: ["latest", { name: "stable" }] };
const template = "{ version } { tags[0] } { tags[1].name }";
const options = { fallback: "N/A" };

console.log( render(template, context, { ...options, depth: -1 }) );
// v1.0.0 latest stable

console.log( render(template, context, { ...options, depth: 0 }) );
// N/A N/A N/A

console.log( render(template, context, { ...options, depth: 2 }) );
// v1.0.0 latest N/A
```



## Override Options

Options used to override compile options during rendering.

Supported Options:

- [fallback](#fallback)
- [depth](#depth)

```javascript
import { compile } from "@kimzuni/templify";

const context = { author: "John Doe", draft_status: "pending" };
const template = "{ title } / { author } / { draft_status }";
const options = { key: /[a-z0-9]+/, fallback: "Unknown" };

const c = compile(template, options);

console.log( c.render(context) );
// Unknown / John Doe / { draft_status }

console.log( c.render(context, { fallback: undefined }) );
// { title } / John Doe / { draft_status }

console.log( c.render(context, { fallback: "N/A" }) );
// N/A / John Doe / { draft_status }

console.log( c.render(context, { fallback: null }) );
// null / John Doe / { draft_status }
```
