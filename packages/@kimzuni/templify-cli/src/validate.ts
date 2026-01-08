import { CommanderError, InvalidArgumentError } from "@commander-js/extra-typings";
import * as tply from "@kimzuni/templify";

import type { SubCommand, Options } from "./types";
import { ARGUMENTS, OPTIONS } from "./constants";
import { isInteractiveStdin, isNonInteractiveStdin } from "./utils";



export function toNumber(value: string) {
	const number = Number(value);
	if (!value.length || isNaN(number)) {
		throw new InvalidArgumentError("Not a Number.");
	}
	return number;
}

export function toNumberArray(value: string) {
	const split = value.split(/[, ]/g);
	return split.filter(Boolean).map(toNumber);
}

export function userInputs(
	stream: NodeJS.ReadStream,
	subCommand: SubCommand,
	args: string[],
	opts: Options,
) {
	const argsLength = args.length;
	const isNonInteractive = Number(opts.stdin && isNonInteractiveStdin(stream));
	const isInteractive = isInteractiveStdin(stream);
	const hasInlineTemplate = Number(opts.template !== undefined);
	const hasTemplateFile = Number(opts.templateFile !== undefined);
	let numberOfTemplates = isNonInteractive + hasInlineTemplate + hasTemplateFile;
	const hasTemplateInArgs = Number(numberOfTemplates === 0 && !!argsLength);
	numberOfTemplates += hasTemplateInArgs;
	const keyValueLength = argsLength - hasTemplateInArgs;

	const oneOf = `stdin, '${OPTIONS.template.flags}', '${OPTIONS.templateFile.flags}', or '[${ARGUMENTS.TEMPLATE.name()}]'`;
	if (numberOfTemplates > 1) {
		throw new CommanderError(1, "conflicts", `Error: multiple template sources specified. Only one of ${oneOf}`);
	} else if (numberOfTemplates !== 1 && !isInteractive) {
		throw new CommanderError(1, "conflicts", `Error: no template sources specified. Specify one of ${oneOf}`);
	}

	if (opts.key !== undefined && opts.keyPattern !== undefined) {
		throw new CommanderError(2, "conflicts", `Error: option '${OPTIONS.key.flags}' cannot be used with option '${OPTIONS.keyPattern.flags}'`);
	} else if (opts.keyPattern !== undefined && !(opts.keyPattern.toUpperCase() in tply.KEY_PATTERNS)) {
		const arr = Object.keys(tply.KEY_PATTERNS).map(x => x.toLowerCase());
		throw new CommanderError(2, "invalid", `Error: option '${OPTIONS.keyPattern.flags}' argument '${opts.keyPattern}' is invalid. Allowed choices are ${arr.join(", ")}.`);
	}

	if (subCommand === "render") {
		for (const key of ["compact"] as const) {
			if (opts[key] !== undefined) {
				throw new CommanderError(2, "unsupported", `Error: option '${OPTIONS[key].flags}' cannot be used with subcommand 'render'`);
			}
		}
	} else {
		if (keyValueLength) {
			throw new CommanderError(2, "unsupported", `Error: positional argument '[${ARGUMENTS.KEY_VALUE.name()}]' is only supported by subcommand 'render'`);
		}
		for (const key of ["dataFile", "fromEnv", "fallback"] as const) {
			if (opts[key] !== undefined) {
				throw new CommanderError(2, "unsupported", `Error: option '${OPTIONS[key].flags}' is only supported by subcommand 'render'`);
			}
		}
	}
}
