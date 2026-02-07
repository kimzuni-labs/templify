# @kimzuni/templify-cli

[![NPM version](https://img.shields.io/npm/v/@kimzuni/templify-cli.svg)](https://www.npmjs.com/package/@kimzuni/templify-cli)
[![codecov](https://codecov.io/gh/kimzuni-labs/templify/graph/badge.svg?token=932ALHWG7H&component=templify-cli)](https://codecov.io/gh/kimzuni-labs/templify/tree/main/packages/@kimzuni/templify-cli)

CLI for the
[@kimzuni/templify](../templify//README.md)
a flexible template string processor.

It supports customizable
template delimiters,
spacing rules,
fallback values,
and etc.



## Installation

```shell
npm install -g @kimzuni/templify-cli
```



## Example

```shell
templify "{ key1 }, { key2 }!" key1=hello key2=world
# hello, world!

# or (alias)
tply "{ key1 }, { key2 }!" key1=hello key2=world
# hello, world!

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
echo template string | templify

templify < template-file.txt

templify << EOF
template string
EOF

templify <<< "template string"

templify "template string"

templify -t "template string" # or --template

templify -T template-file.txt # or --template-file

templify
# Press Ctrl+d to signal end-of-file (EOF).
```

### KEY=VALUE(Render Data)

> [!NOTE]
> render-only option

Key-value pairs used as render data.
This data forms the rendering context for the template.

Merge order (later sources override earlier ones):

1. environment variables option: `-e`, `--from-env`
2. data file option: `-D`, `--data-file`
3. positional argument: `[KEY=VALUE...]`

```shell
echo -n "Hello, { USER }!" | templify
# Hello, { USER }!

echo -n "Hello, { USER }!" | templify XXX=USER_1
# Hello, { USER }!

echo -n "Hello, { USER }!" | templify USER=USER_1
# Hello, USER_1!

echo -n "Hello, { USER }!" | templify -e
# Hello, kimzuni!

echo "USER=USER_1" > test.env
echo -n "Hello, { USER }!" | templify -e -D test.env
# Hello, USER_1!

echo '{ "USER": "USER_2" }' > test.json
echo -n "Hello, { USER }!" | templify -e -D test.json
# Hello, USER_2!

echo -n "Hello, { USER }!" | templify -e -D test.json USER=Guest
# Hello, Guest!
```

### `--no-stdin`

Disable reading from standard input.

```shell
echo -n "{ key1 }, { key2 }!" | templify key1=hello key2=world
# hello, world!

echo -n "{ key1 }, { key2 }!" | templify key1=hello key2=world --no-stdin
# key1=hello
```

### `--no-validate`

Disable validation of option usage and conflict checks.

```shell
# Conflict between stdin and -T(--template-file) option
echo -n "{ key1 }, { key2 }!" | templify -T file.txt key1=hello key2=world
# Error: ...

echo -n "{ key1 }, { key2 }!" | templify -T file.txt key1=hello key2=world --no-validate
# hello, world!

# --compact is non-render option
echo -n "{ key1 }, { key2 }!" | templify key1=hello key2=world --compact
# Error: ...

echo -n "{ key1 }, { key2 }!" | templify key1=hello key2=world --compact --no-validate
# hello, world!
```

### `--compact`

> [!NOTE]
> non-render option

Output compact JSON without indentation or newlines.

```shell
templify groups "{ key } / {key1} / { key} / {key1}"
# {
#   key: [ "{ key }", "{ key}" ],
#   key1: [ "{key1}" ],
# }

templify groups "{ key } / {key1} / { key} / {key1}" --compact
# {"key":["{ key }","{ key}"],"key1":["{key1}"]}
```

### `--key-pattern`

Select a predefined key pattern for placeholders.

`<name>` must be one of the values defined in
[KEY_PATTERNS](https://github.com/kimzuni-labs/templify/blob/main/packages/%40kimzuni/templify/src/constants.ts#L3).

```shell
echo "{ key1 } / { key2[0].key3 }" | templify keys --key-pattern default
# [ "key1" ]

echo "{ key1 } / { key2[0].key3 }" | templify keys --key-pattern deep
# [ "key1", "key2[0].key3" ]
```

### `--depth`

> [!NOTE]
> While `--depth` is a render-only option in the `@kimzuni/templify`,
> the CLI treats it as a common option.

Controls how deeply nested values are resolved,
and is also used by the CLI to infer key patterns for nested placeholders.

```shell
echo "{ key1 } / { key2[0].key3 }" | templify keys
# [ "key1" ]

echo "{ key1 } / { key2[0].key3 }" | templify keys --depth 1
# [ "key1" ]

echo "{ key1 } / { key2[0].key3 }" | templify keys --depth 1 --key-pattern deep
# [ "key1", "key2[0].key3" ]

echo "{ key1 } / { key2[0].key3 }" | templify keys --depth -1 # --key-pattern deep
# [ "key1", "key2[0].key3" ]

echo "{ key1 } / { key2[0].key3 }" | templify keys --depth -1 --key-pattern default
# [ "key1" ]

echo "{ key1 } / { key2[0].key3 }" | templify keys --depth -1 --key "\\w+"
# [ "key1" ]
```

### templify Options

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
