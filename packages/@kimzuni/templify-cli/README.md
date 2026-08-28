# @kimzuni/templify-cli

[![NPM version](https://img.shields.io/npm/v/@kimzuni/templify-cli.svg)](https://www.npmjs.com/package/@kimzuni/templify-cli)
[![codecov](https://codecov.io/gh/kimzuni-labs/templify/graph/badge.svg?token=932ALHWG7H&component=templify-cli)](https://codecov.io/gh/kimzuni-labs/templify/tree/main/packages/@kimzuni/templify-cli)

Command-line interface for
[@kimzuni/templify](../templify/README.md),
a lightweight and highly flexible template string processor.

It supports customizable template delimiters, spacing rules, and fallback values in the terminal environment.
It can be used with shell pipelines, environment variables, and external data files (`.json`, `.env`).



## Overview

![example commands](images/example.gif)

## Installation

```shell
# npm
npm install -g @kimzuni/templify-cli

# yarn
yarn global add @kimzuni/templify-cli

# pnpm
pnpm add -g @kimzuni/templify-cli

# bun
bun add -g @kimzuni/templify-cli
```

## Example

```shell
templify "Hello, {name}!" name=World
# Hello, World!

# or (using alias)
tply "Hello, {name}!" name=World
# Hello, World!

templify -h # or --help

templify -v # or --version
```



## Options

All options except [Template](#template) are optional.

### Subcommand

> [!IMPORTANT]
> The subcommand must be provided as the first argument.
> Otherwise, it is treated as a template string or render data.

- Choices: `render`, `keys`, `placeholders`, `fields`, `groups`
- Default: `render`

See the
[@kimzuni/templify Example](../templify/README.md#example)
for subcommands behavior.

### Template

The template string to render.
A template is required and can be provided in several ways.

Template resolution order:

1. piped or redirected input
2. inline template option: `-t`, `--template`
3. template file option: `-T`, `--template-file`
4. positional argument: `TEMPLATE`
    + If a template has already been resolved, the value is treated as `KEY=VALUE` render data.
5. wait for input from stdin (TTY only)

```shell
echo "Hello, { user }!" | templify

templify < template.txt

templify << EOF
Welcome to { os }!
EOF

templify <<< "Welcome to { os }!"

templify "Welcome to { os }!"

templify -t "Welcome to { os }!" # or --template

templify -T template.txt # or --template-file

templify
# Press Ctrl+d to signal end-of-file (EOF).
```

### KEY=VALUE (Render Data)

> [!NOTE]
> render-only option

Key-value pairs used as render data.
This data forms the rendering context for the template.

Merge order (later sources override earlier ones):

1. environment variables option: `-e`, `--from-env`
2. data file option: `-D`, `--data-file`
3. positional argument: `[KEY=VALUE...]`

```shell
# Missing key remains unresolved
echo "Hello, { USER }!" | templify
# Hello, { USER }!

# Unrelated key is ignored
echo "Hello, { USER }!" | templify role=World
# Hello, { USER }!

# Directly passing key-value
echo "Hello, { USER }!" | templify USER=World
# Hello, World!

# Reading from system environment variables (e.g., $USER)
echo "Hello, { USER }!" | templify -e # or --from-env
# Hello, kimzuni!

# Reading from .env file
echo "USER=John Doe" > test.env
echo "Hello, { USER }!" | templify -e -D test.env # or --data-file
# Hello, John Doe!

# Reading from .json file
echo '{ "USER": "Jane Smith" }' > test.json
echo "Hello, { USER }!" | templify -e -D test.json
# Hello, Jane Smith!

# Positional arguments override file data
echo "Hello, { USER }!" | templify -e -D test.json USER=Guest
# Hello, Guest!
```

### `--no-stdin`

Disable reading from standard input.

```shell
echo "Hello, { name }!" | templify name=World
# Hello, World!

echo "Hello, { name }!" | templify name=World --no-stdin
# name=World
```

### `--no-validate`

Disable validation of option usage and conflict checks.

```shell
# Conflict between stdin and -T(--template-file) option
echo "Hello, { name }!" | templify -T file.txt name=World
# Error: multiple template sources specified...

echo "Hello, { name }!" | templify -T file.txt name=World --no-validate
# Hello, World!

# --compact is a non-render option
echo "Hello, { name }!" | templify name=World --compact
# Error: option '--compact'...

echo "Hello, { name }!" | templify name=World --compact --no-validate
# Hello, World!
```

### `--compact`

> [!NOTE]
> non-render option

Output compact JSON without indentation or newlines.

```shell
templify groups "Target: { host } / {host} / { port }"
# {
#   host: [ "{ host }", "{host}" ],
#   port: [ "{ port }" ]
# }

templify groups "Target: { host } / {host} / { port }" --compact
# {"host":["{ host }","{host}"],"port":["{ port }"]}
```

### `--key-pattern`

Select a predefined key pattern for placeholders.

Value must be one of the values defined in
[KEY_PATTERNS](https://github.com/kimzuni-labs/templify/blob/main/packages/%40kimzuni/templify/src/constants/key-patterns.ts).

```shell
echo "{ app.name } / { app.servers[0].ip }" | templify keys --key-pattern shallow
# []

echo "{ app.name } / { app.servers[0].ip }" | templify keys --key-pattern deep
# [ "app.name", "app.servers[0].ip" ]
```



## templify Options

The following options are forwarded to the
[@kimzuni/templify Options](../templify/README.md#options).

| Short | Long               |
|-------|--------------------|
| `-k`  | `--key`            |
| `-o`  | `--open`           |
| `-c`  | `--close`          |
| -     | `--spacing-size`   |
| -     | `--spacing-strict` |
| `-f`  | `--fallback`       |
| -     | `--depth`          |

### `--key`

Regex pattern string defining valid characters for placeholder keys.

```shell
templify keys "Hello, { name1 }!" --key "[a-z]+"
# []
```

### `--open` / `--close`

Custom string delimiters for placeholders.

```shell
templify keys "Hello, <%= name %>!" -o "<%=" -c "%>"
# [ 'name' ]
```

### `--spacing-size`

Specifies the allowed number or range of spaces inside template placeholders.
You can provide a single number or a range separated by a colon (`:`).

| CLI Syntax | Core Equivalent  | Description                       |
|------------|------------------|-----------------------------------|
| `1`        | `1`              | Exactly 1 space                   |
| `1:3`      | `[1, 3]`         | Between 1 and 3 spaces            |
| `1:`       | `[1, undefined]` | At least 1 space (no upper limit) |
| `:3`       | `[undefined, 3]` | Up to 3 spaces (no lower limit)   |

```shell
templify keys "Hello, {  name  }!" --spacing-size 1
# []

templify keys "Hello, {  name  }!" --spacing-size 2
# [ 'name' ]

templify keys "Hello, {  name  }!" --spacing-size 1:3
# [ 'name' ]
```

### `--spacing-strict`

A boolean flag to enforce strict symmetric spacing.
It does not accept a value: providing the flag sets the option to `true`, and omitting it defaults to `false`.

```shell
templify keys "Hello, {  name  }!" --spacing-strict
# [ 'name' ]

templify keys "Hello, { name  }!" --spacing-strict
# []
```

### `--fallback`

Fallback string to use when a template key is missing in the render data.

```shell
templify "Hello, { name }!"
# Hello, { name }!

templify "Hello, { name }!" -f "Unknown"
# Hello, Unknown!
```

### `--depth`

Maximum depth (number) for resolving nested keys in the render data.

```shell
cat data.json
# {
#   "database": {
#     "host": "localhost",
#     "port": 5432
#   }
# }

# Cannot resolve nested 'database.host'
templify "Target: { database.host }" -D data.json -f "Unknown" --depth 1
# Target: Unknown

# Set -1 or increase depth to resolve nested objects
templify "Target: { database.host }" -D data.json -f "Unknown" --depth 2
# Target: localhost
```
