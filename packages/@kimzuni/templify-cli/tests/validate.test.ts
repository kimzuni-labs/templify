import { describe, test, expect } from "bun:test";

import type { SubCommand, Options } from "../src/types";
import { toNumber, toNumberArray, userInputs } from "../src/validate";
import { subCommands } from "../src/common";

import { createStdin, type CreateStdinProps } from "./common";



test("toNumber", () => {
	expect(toNumber("1")).toBe(1);
	expect(toNumber("11")).toBe(11);
	expect(toNumber("11111")).toBe(11111);
	expect(() => toNumber("")).toThrow();
	expect(() => toNumber("x")).toThrow();
});

test("toNumberArray", () => {
	expect(toNumberArray("")).toStrictEqual([]);
	expect(toNumberArray("1,2,3")).toStrictEqual([1, 2, 3]);
	expect(toNumberArray("1 2 3")).toStrictEqual([1, 2, 3]);
	expect(toNumberArray("1, 2, 3")).toStrictEqual([1, 2, 3]);
	expect(() => toNumberArray("x")).toThrow();
});

describe("userInputs", () => {
	const withoutRenderCommands = subCommands.filter(x => x !== "render");
	const run = (
		stream: string,
		streamOpts: CreateStdinProps,
		subcommand: SubCommand,
		args: string[],
		opts: Partial<Options>,
	) => () => {
		userInputs(
			createStdin(stream, streamOpts),
			subcommand,
			args,
			{
				stdin   : true,
				validate: true,
				...opts,
			},
		);
	};

	test("should resolve template conflicts using precedence: stdin > --template > --template-file > TEMPLATE(only non render)", () => {
		// pipe/redirect, --template, --template-file, pos arg, waits

		for (const key of subCommands) {
			expect(run("stdin", {}, key, [], {})).not.toThrow();
			expect(run("", { readable: false }, key, ["arg1"], {})).not.toThrow();
			expect(run("", { readable: false }, key, [], { template: "str" })).not.toThrow();
			expect(run("", { readable: false }, key, [], { templateFile: "path" })).not.toThrow();
			expect(run("stdin", { isTTY: true }, key, [], { templateFile: "path" })).not.toThrow();
			expect(run("stdin", { isTTY: true }, key, [], {})).not.toThrow();

			expect(run("stdin", {}, key, [], { template: "str" })).toThrow();
			expect(run("stdin", {}, key, [], { templateFile: "path" })).toThrow();
			expect(run("stdin", { isTTY: false }, key, [], { template: "str" })).toThrow();
			expect(run("stdin", { isTTY: false }, key, [], { templateFile: "path" })).toThrow();
			expect(run("", { readable: false }, key, [], { template: "str", templateFile: "path" })).toThrow();
			expect(run("", { readable: false }, key, [], {})).toThrow();
		}

		expect(run("stdin", {}, "render", ["arg1", "arg2", "arg3"], {})).not.toThrow();
		expect(run("", { readable: false }, "render", ["arg1", "arg2", "arg3"], { template: "str" })).not.toThrow();
		expect(run("", { readable: false }, "render", ["arg1", "arg2", "arg3"], { templateFile: "path" })).not.toThrow();

		for (const key of withoutRenderCommands) {
			expect(run("", { readable: false }, key, ["arg1"], {})).not.toThrow();

			expect(run("", { readable: false }, key, ["arg1"], { template: "str" })).toThrow();
			expect(run("", { readable: false }, key, ["arg1"], { templateFile: "path" })).toThrow();
			expect(run("stdin", {}, key, ["arg1"], {})).toThrow();
		}
	});

	test("should allow fallback option only in render", () => {
		expect(run("stdin", {}, "render", [], { fallback: undefined })).not.toThrow();
		expect(run("stdin", {}, "render", [], { fallback: "x" })).not.toThrow();
		for (const key of withoutRenderCommands) {
			expect(run("stdin", {}, key, [], { fallback: undefined })).not.toThrow();
			expect(run("stdin", {}, key, [], { fallback: "x" })).toThrow();
		}
	});

	test("should reject compact option in render", () => {
		expect(run("stdin", {}, "render", [], { compact: undefined })).not.toThrow();
		expect(run("stdin", {}, "render", [], { compact: true })).toThrow();
		for (const key of withoutRenderCommands) {
			expect(run("stdin", {}, key, [], { compact: undefined })).not.toThrow();
			expect(run("stdin", {}, key, [], { compact: true })).not.toThrow();
		}
	});
});
