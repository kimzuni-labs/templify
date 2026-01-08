import { Option, Argument } from "@commander-js/extra-typings";

import { toNumber, toNumberArray } from "./validate";



export type SubCommand = typeof SUB_COMMANDS[number];
export const SUB_COMMANDS = [
	"keys",
	"placeholders",
	"fields",
	"groups",
	"render",
] as const;

export const ARGUMENTS = {
	COMMAND  : new Argument("[COMMAND]", `Subcommand to execute. Must be the first argument. (Default: render; Choices: ${SUB_COMMANDS.join(", ")})`),
	TEMPLATE : new Argument("[TEMPLATE]", "Template string to render. May be provided as a positional argument, or via stdin, --template, or --template-file."),
	KEY_VALUE: new Argument("[KEY=VALUE...]", "Key-value pairs used as render data."),
};

export const OPTIONS = {
	noValidate   : new Option("--no-validate", "Disable validation of option usage and conflict checks."),
	noStdin      : new Option("--no-stdin", "Disable reading from standard input."),
	template     : new Option("-t, --template <string>", "Provide the template as an inline string."),
	templateFile : new Option("-T, --template-file <string>", "Load the template from a file."),
	key          : new Option("-k, --key <string>", "Regex pattern defining valid characters for placeholder keys. Controls which characters are allowed inside the delimiters."),
	keyPattern   : new Option("--key-pattern <name>", "Use a predefined key pattern for placeholders (e.g. deep for nested keys)."),
	open         : new Option("-o, --open <string>", "Opening delimiter for placeholders."),
	close        : new Option("-c, --close <string>", "Closing delimiter for placeholders."),
	spacingSize  : new Option("--spacing-size <string|number>", "Allowed number(s) of spaces inside placeholder delimiters. A negative value disables space checking. (e.g. \"1,2,3\", \"1 2 3\", \"1, 2, 3\")").argParser(toNumberArray),
	spacingStrict: new Option("--spacing-strict", "Enforce exact spacing rules."),
	fallback     : new Option("-f, --fallback <string>", "Fallback value to use when a template key is missing."),
	depth        : new Option("--depth <number>", "Maximum depth for resolving nested keys, useful for JSON contexts.").argParser(toNumber),
	dataFile     : new Option("-D, --data-file <string>", "Load render data from a file. Supports JSON and .env-style formats."),
	fromEnv      : new Option("-e, --from-env", "Use environment variables as render data."),
	compact      : new Option("--compact", "Output compact JSON without indentation or newlines."),
};
