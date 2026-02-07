import { Command, Option, CommanderError } from "@commander-js/extra-typings";
import * as tply from "@kimzuni/templify";
import tplyPkg from "@kimzuni/templify/package.json" with { type: "json" };

import pkg from "../package.json";

import type { SubCommand } from "./types";
import { userInputs } from "./validate";
import { SUB_COMMANDS, ARGUMENTS, OPTIONS } from "./constants";
import { capitalize, loadContext, loadTemplate, toTemplifyOptions } from "./utils";



export function isSubCommand(value: string): value is SubCommand {
	return SUB_COMMANDS.includes(value as SubCommand);
}

export type Options = Partial<ReturnType<ReturnType<typeof getCommand>["opts"]>>;
export function getCommand(argv: string[], name = "templify", description = pkg.description) {
	const command = new Command(name)
		.usage("[COMMAND] [OPTIONS...] [TEMPLATE] [KEY=VALUE...]")
		.description(description)
		.addArgument(ARGUMENTS.COMMAND)
		.addArgument(ARGUMENTS.TEMPLATE)
		.addArgument(ARGUMENTS.KEY_VALUE)
		.optionsGroup("Common Options:")
		.addOption(OPTIONS.noStdin)
		.addOption(OPTIONS.noValidate)
		.addOption(OPTIONS.template)
		.addOption(OPTIONS.templateFile)
		.addOption(OPTIONS.depth)
		.addOption(OPTIONS.key)
		.addOption(OPTIONS.keyPattern)
		.addOption(OPTIONS.open)
		.addOption(OPTIONS.close)
		.addOption(OPTIONS.spacingSize)
		.addOption(OPTIONS.spacingStrict)
		.version(`${tplyPkg.name}    : ${tplyPkg.version}\n${pkg.name}: ${pkg.version}`, "-v, --version", "Output the version number.")
		.helpOption("-h, --help", "Display help information.")
		.optionsGroup("Render Options:")
		.addOption(OPTIONS.dataFile)
		.addOption(OPTIONS.fromEnv)
		.addOption(OPTIONS.fallback)
		.optionsGroup("Non-Render Options:")
		.addOption(OPTIONS.compact)
		.configureHelp({
			optionTerm(option: Option) {
				const hintClose = option.flags.at(-1) ?? "";
				const hintOpen = hintClose === ">" ? "<" : hintClose == "]" ? "[" : "";
				const hasHint = [">", "]"].includes(hintClose);
				const hint = hasHint ? option.flags.slice(option.flags.lastIndexOf(hintOpen)) : "";
				const short = option.short ?? "";
				const long = option.long ?? "";
				return `${short.padStart(2, " ")}${short && long ? "," : " "} ${long} ${hint}`;
			},
		})
		.configureOutput({
			writeErr: () => "",
		})
		.exitOverride()

		.action(async (_C, _T, _K, opts, cmd) => {
			const subCommand = (isSubCommand(argv[0]) ? cmd.args.shift() as SubCommand : undefined) ?? "render";
			if (opts.validate) userInputs(process.stdin, subCommand, cmd.args, opts);

			const TEMPLATE = cmd.args.shift();
			const KEY_VALUE = cmd.args;
			const template = await loadTemplate(process.stdin, TEMPLATE, KEY_VALUE, opts);
			const compileOptions = toTemplifyOptions(opts);
			if (subCommand === "render") {
				const context = await loadContext(KEY_VALUE, opts);
				const result = tply.render(template, context, compileOptions);
				process.stdout.write(result);
			} else {
				const result = tply[subCommand](template, compileOptions);

				if (opts.compact === true) {
					console.log(JSON.stringify(result));
				} else {
					if (!process.stdout.isTTY) {
						console.log(JSON.stringify(result, undefined, 2));
					} else {
						console.log(result);
					}
				}
			}
		});

	command.addHelpText("afterAll", [
		"",
		"More information & issues:",
		`  ${pkg.homepage}`,
	].join("\n"));

	return command;
}



export async function run(argv = process.argv.slice(2)) {
	const command = getCommand(argv);

	let exitCode = 0;
	try {
		await command.parseAsync(argv, { from: "user" });
	} catch (e) {
		exitCode = e instanceof CommanderError ? e.exitCode : -1;
		if (exitCode !== 0) {
			let msg = e instanceof Error ? e.message : String(e);
			msg = msg === "(outputHelp)" ? command.helpInformation() : capitalize(msg).trimEnd();
			console.error(msg);
		}
	}
	process.exitCode = exitCode;
}
