import { Option, Argument } from "@commander-js/extra-typings";
import * as tply from "@kimzuni/templify";

import type { SubCommand } from "./types";
import { toNumberArray } from "./validate";



export const subCommands = Object.keys(tply).filter(x => x !== "compile") as SubCommand[];

export const ARGUMENTS = {
	COMMAND  : new Argument("[COMMAND]", `Subcommand to execute. Must be the first argument. (Default: render; Choices: ${subCommands.join(", ")})`),
	TEMPLATE : new Argument("[TEMPLATE]", "Template string to render. May be provided as a positional argument, or via stdin, --template, or --template-file."),
	KEY_VALUE: new Argument("[KEY=VALUE...]", "Key-value pairs used as render data."),
};

export const OPTIONS = {
	noValidate   : new Option("--no-validate", "Disable validation of option usage and conflict checks."),
	noStdin      : new Option("--no-stdin", "Disable reading from standard input."),
	template     : new Option("-t, --template <string>", "Provide the template as an inline string."),
	templateFile : new Option("-T, --template-file <string>", "Load the template from a file."),
	key          : new Option("-k, --key <string>", "Regex pattern defining valid characters for placeholder keys. Controls which characters are allowed inside the delimiters."),
	open         : new Option("-o, --open <string>", "Opening delimiter for placeholders."),
	close        : new Option("-c, --close <string>", "Closing delimiter for placeholders."),
	spacingSize  : new Option("--spacing-size <string|number>", "Allowed number(s) of spaces inside placeholder delimiters. A negative value disables space checking. (e.g. \"1,2,3\", \"1 2 3\", \"1, 2, 3\")").argParser(toNumberArray),
	spacingStrict: new Option("--spacing-strict", "Enforce exact spacing rules."),
	fallback     : new Option("-f, --fallback <string>", "Fallback value to use when a template key is missing."),
	dataFile     : new Option("-D, --data-file <string>", "Load render data from a file. Supports JSON and .env-style formats."),
	fromEnv      : new Option("-e, --from-env", "Use environment variables as render data."),
	compact      : new Option("--compact", "Output compact JSON without indentation or newlines."),
};
