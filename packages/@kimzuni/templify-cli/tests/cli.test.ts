import { describe, test, expect } from "bun:test";

import * as tply from "@kimzuni/templify";

import pkg from "../package.json";
import { SUB_COMMANDS } from "../src/constants";
import { loadContext } from "../src/utils";
import * as cli from "../src/cli";

import type { Env, CreateStdinProps } from "./common";
import { randomString, tempfile, mockStdin, mockStdout, mockEnv, capture, stdoutToString } from "./common";



const template = "{ key } / { KEY } / { KEY-0 } / { KEY}";
const data = ["key=val", "KEY=VAL", "KEY-0=VAL-0"];

interface RunOption extends CreateStdinProps {
	stream?: string;
	env?   : Env;
}

const run = (
	argv: string[] = [],
	{ env, stream, isTTY, readable }: RunOption = {},
) => mockEnv(env ?? process.env, async () => {
	const result = await mockStdin(stream, { isTTY, readable }, () => capture(async () => {
		await cli.run(argv);
	}));
	return result.frame;
});

/**
 * @param stream if not Stream type, write stdin
 */
const check = async (
	opts: CreateStdinProps & { stdin?: boolean; isENV?: boolean } = {},
	template: string,
	optKeys: string[],
	args: string[],
	expectedOrOpts: string | tply.CompileOptions,
	context?: tply.Context,
) => {
	const stream = opts.stdin ? template : undefined;
	const expected = typeof expectedOrOpts === "string"
		? expectedOrOpts
		: tply.render(
			template,
			context ?? await loadContext(data, {}),
			expectedOrOpts,
		);

	const prefix: string[] = opts.stdin ? [] : [template];
	const step = async (extraArgs: string[] = []) => {
		const s = await run(
			[...prefix, ...extraArgs, ...args],
			{
				env: opts.isENV !== false ? context as Env : undefined,
				stream,
				...opts,
			},
		);
		expect(s.exitCode).toBe(0);
		expect(stdoutToString(s.log)).toBe(expected);
	};

	for (const item of optKeys) await step([item]);
	if (!optKeys.length) await step();
};



describe("Options", () => {
	describe("common", () => {
		test("--help", async () => {
			const result = await run(["--help"]);
			expect(result.exitCode).toBe(0);
			expect(stdoutToString(result.log)).toStartWith("Usage:");
		});

		test("--version", async () => {
			const result = await run(["--version"]);
			expect(result.exitCode).toBe(0);
			expect(stdoutToString(result.log)).toEndWith(pkg.version);
		});

		describe("template", () => {
			test("pipe/redirect", async () => {
				await check(
					{ stdin: true },
					template,
					[],
					[],
					template,
				);
			});

			test("--template", async () => {
				await check(
					{},
					template,
					["-t", "--template"],
					[template],
					template,
				);
			});

			test("--template-file", async () => {
				const templateFile = await tempfile(template);
				await check(
					{},
					template,
					["-T", "--template-file"],
					[templateFile],
					template,
				);
			});

			test("argument", async () => {
				await check(
					{},
					template,
					[],
					[],
					template,
				);
			});

			test("stdin in a tty", async () => {
				await check(
					{ stdin: true, isTTY: true },
					template,
					[],
					[],
					template,
				);
			});
		});

		test("--key", async () => {
			const key = "[a-z]+";
			await check(
				{},
				template,
				["-k", "--key"],
				[key, ...data],
				{ key },
			);
		});

		test("--key-pattern", async () => {
			await check(
				{},
				template,
				["--key-pattern"],
				["default", ...data],
				{ key: tply.KEY_PATTERNS.DEFAULT },
			);

			await check(
				{},
				template,
				["--key-pattern"],
				["deep", ...data],
				{ key: tply.KEY_PATTERNS.DEEP },
			);

			await check(
				{},
				template,
				["--key-pattern"],
				["DEeP", ...data],
				{ key: tply.KEY_PATTERNS.DEEP },
			);
		});

		test("--open", async () => {
			const open = "<%=";
			await check(
				{},
				`${open} key }`,
				["-o", "--open"],
				["<%=", ...data],
				{ open },
			);
		});

		test("--close", async () => {
			const close = "%>";
			await check(
				{},
				`{ key ${close}`,
				["-c", "--close"],
				[close, ...data],
				{ close },
			);
		});

		describe("--spacing", () => {
			test("-size", async () => {
				await check(
					{},
					template,
					["--spacing-size"],
					["1,2", ...data],
					{ spacing: [1, 2] },
				);
			});

			test("-strict", async () => {
				await check(
					{},
					template,
					["--spacing-strict"],
					["--", ...data],
					{ spacing: true },
				);
			});
		});

		describe("--depth", () => {
			const template = "{ x }/{ a.b }/{ a.c[0] }/{ a.c.1.d }";

			test("should infer deep key pattern from depth when no key option is explicitly provided", async () => {
				const customKey = "[\\w.]+";
				const defaultKeys = tply.keys(template);
				const deepKeys = tply.keys(template, { key: tply.KEY_PATTERNS.DEEP });
				const customKeys = tply.keys(template, { key: customKey });

				const noDepth = await run(["keys", template]);
				expect(noDepth.log[0][0]).toStrictEqual(defaultKeys);

				const result = await run(["keys", template, "--depth", "2"]);
				expect(result.log[0][0]).toStrictEqual(deepKeys);

				const withKey = await run(["keys", template, "--depth", "2", "--key", customKey]);
				expect(withKey.log[0][0]).toStrictEqual(customKeys);

				const withPattern = await run(["keys", template, "--depth", "2", "--key-pattern", "default"]);
				expect(withPattern.log[0][0]).toStrictEqual(defaultKeys);
			});
		});

		test("--no-validate", async () => {
			const conflicts = await run(["-t", "str", "-T", "path"]);
			expect(conflicts.exitCode).toBe(1);

			const bypass = await run(["-t", "str", "-T", "path", "--no-validate"]);
			expect(bypass.exitCode).toBe(0);
		});

		test("--no-stdin", async () => {
			const conflicts = await run(["-t", template], { stream: "stream data" });
			expect(conflicts.exitCode).toBe(1);

			const noStdin = await run(["-t", template, "--no-stdin"], { stream: "stream data" });
			expect(noStdin.exitCode).toBe(0);
			expect(stdoutToString(noStdin.log)).toBe(template);
		});
	});

	describe("render", () => {
		describe("data", () => {
			test("argument", async () => {
				await check(
					{},
					template,
					[],
					data,
					{},
				);
			});

			describe("--data-file", () => {
				test(".env", async () => {
					const dataFile = await tempfile(data.join("\n"));
					await check(
						{},
						template,
						["-D", "--data-file"],
						[dataFile],
						{},
					);
				});

				test(".json", async () => {
					const string = JSON.stringify(await loadContext(data, {}));
					const dataFile = await tempfile(string);
					await check(
						{},
						template,
						["-D", "--data-file"],
						[dataFile],
						{},
					);
				});
			});

			test("--from-env", async () => {
				const key = randomString().replace(/-/g, "_");
				const value = randomString();
				const template = `{ ${key} }`;
				await check(
					{},
					template,
					["-e", "--from-env"],
					[],
					{},
					{ [key]: value },
				);
			});
		});

		test("--fallback", async () => {
			const fallback = "x";
			await check(
				{},
				template,
				["-f", "--fallback"],
				[fallback],
				{ fallback },
				{},
			);
		});

		test("--depth", async () => {
			const template = "{ x }/{ a.b }/{ a.c[0] }/{ a.c.1.d }";
			const depth = 2;
			const context = {
				x: "xxx",
				a: {
					b: 111,
					c: [
						null,
						{ d: "x" },
					],
				},
			};

			const filepath = await tempfile(JSON.stringify(context));
			await check(
				{ isENV: false },
				template,
				["--depth"],
				[`${depth}`, "-D", filepath],
				{ depth: depth, key: tply.KEY_PATTERNS.DEEP },
				context,
			);
		});
	});

	describe("non render", () => {
		test("--compact", async () => {
			const groups = tply.groups(template);

			const nonCompact = await run(["groups", template]);
			expect(nonCompact.log[0][0]).toStrictEqual(groups);

			await mockStdout({ isTTY: false }, async () => {
				const nonCompactNoTTY = await run(["groups", template], { stream: "", isTTY: false, readable: false });
				expect(nonCompactNoTTY.log[0][0]).toStrictEqual(JSON.stringify(groups, undefined, 2));
			});

			const compact = await run(["groups", template, "--compact"]);
			expect(compact.log[0][0]).toStrictEqual(JSON.stringify(groups));
		});
	});
});

describe("Invalid Option", () => {
	const check = async (args: string[]) => {
		const result = await run(args);
		expect(result.exitCode).not.toBe(0);
		expect(stdoutToString(result.error)).toStartWith("Error:");
	};

	test("unknown option", async () => {
		await check(["--unknown"]);
	});

	describe("invalid value", () => {
		test("spacing", async () => {
			await check(["-s", "x"]);
			await check(["--spacing-size", "x"]);
			await check(["-s", "1, x, 2"]);
		});
	});
});

describe("Sub command", () => {
	test("default", async () => {
		const { frame } = await capture(() => cli.run([template]));
		expect(frame.exitCode).toBe(0);
		expect(stdoutToString(frame.log)).toBe(tply.render(template, {}));
	});

	test("render", async () => {
		const { frame } = await capture(() => cli.run(["render", template]));
		expect(frame.exitCode).toBe(0);
		expect(stdoutToString(frame.log)).toBe(tply.render(template, {}));
	});

	for (const subCommand of SUB_COMMANDS.filter(x => x !== "render")) {
		test(subCommand, async () => {
			const key = subCommand;
			const { frame } = await capture(() => cli.run([subCommand, template]));
			expect(frame.exitCode).toBe(0);
			expect(frame.log).toStrictEqual([[tply[key](template)]]);
		});
	}

	test("non first argument", async () => {
		const groups = await run(["groups", "--compact", "--no-validate"], { stream: template });
		expect(groups.exitCode).toBe(0);
		expect(stdoutToString(groups.log)).toBe(JSON.stringify(tply.groups(template)));

		const noGroups = await run(["--compact", "groups", "--no-validate"], { stream: template });
		expect(noGroups.exitCode).toBe(0);
		expect(noGroups.log[0][0]).toBe(template);
	});
});
