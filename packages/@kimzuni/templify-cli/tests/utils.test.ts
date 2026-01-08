import { describe, test, expect } from "bun:test";
import * as tply from "@kimzuni/templify";

import type { Options } from "../src/types";
import { capitalize, readStream, loadTemplate, loadContext, toTemplifyOptions } from "../src/utils";

import { randomString, tempfile, createStdin, mockEnv } from "./common";



describe("capitalize", () => {
	test("should capitalize a string", () => {
		expect(capitalize("render")).toBe("Render");
		expect(capitalize("keys")).toBe("Keys");
		expect(capitalize("placeholders fields")).toBe("Placeholders fields");
		expect(capitalize("groups")).toBe("Groups");
	});
});

describe("readStream", () => {
	test("should read all data from process.stdin", async () => {
		const randomstr = Bun.randomUUIDv7("buffer").toString();
		expect(await readStream(createStdin(randomstr))).toBe(randomstr);

		const str = "a".repeat(100);
		expect(await readStream(createStdin(str))).toBe(str);
	});
});

describe("loadTemplate", () => {
	const arg = "arg";
	const template = "inline";
	const templateFileContent = "file";
	const stream = "stdin data";
	const fakeStdin = createStdin("", { readable: false });

	test("should load template from stdin, argument, or options", async () => {
		const templateFile = await tempfile(templateFileContent);
		expect(await loadTemplate(fakeStdin, arg, [], {})).toBe(arg);
		expect(await loadTemplate(fakeStdin, undefined, [], { template })).toBe(template);
		expect(await loadTemplate(fakeStdin, undefined, [], { templateFile })).toBe(templateFileContent);
		expect(await loadTemplate(createStdin(stream), undefined, [], {})).toBe(stream);
		expect(await loadTemplate(createStdin(stream, { isTTY: true }), undefined, [], {})).toBe(stream);

		// eslint-disable-next-line @stylistic/max-len
		expect(loadTemplate(createStdin(stream, { isTTY: true, readable: false }), undefined, [], {})).rejects.toBeInstanceOf(Error);

		// eslint-disable-next-line @stylistic/max-len
		expect(loadTemplate(createStdin(stream, { isTTY: false, readable: false }), undefined, [], {})).rejects.toBeInstanceOf(Error);
	});

	test("should resolve template using precedence: stdin > --template > --template-file > argument (fallback: wait for stdin)", async () => {
		const templateFile = await tempfile(templateFileContent);
		expect(await loadTemplate(createStdin(stream, {}), arg, [], { template, templateFile })).toBe(stream);

		const ttyStream = createStdin(stream, { isTTY: true, readable: true });
		expect(await loadTemplate(ttyStream, arg, [], { template, templateFile })).toBe(template);
		expect(await loadTemplate(ttyStream, arg, [], { templateFile })).toBe(templateFileContent);
		expect(await loadTemplate(ttyStream, arg, [], {})).toBe(arg);
		expect(await loadTemplate(ttyStream, undefined, [], {})).toBe(stream);
	});

	test("should add argument to array when template or templateFile is provided", async () => {
		const arr: string[] = [];

		const template = "arg temp";
		expect(await loadTemplate(fakeStdin, undefined, arr, { template })).toBe(template);
		expect(await loadTemplate(fakeStdin, template, arr, { template })).toBe(template);

		const templateFile = await tempfile(template);
		expect(await loadTemplate(fakeStdin, template, arr, { templateFile })).toBe(template);

		expect(arr).toHaveLength(2);
	});
});

describe("loadContext", () => {
	const expected = { key1: "val1", key2: " val2 " };
	const jsonData = { ...expected };
	const envData = ["key1=  val1 # comment ", "key2=  ' val2 '"];

	test("should load data from process.env when fromEnv is true", async () => {
		const randomKey = randomString();
		await mockEnv({
			[randomKey]: randomKey,
		}, async () => {
			const context = await loadContext([], { fromEnv: true });
			expect(context).not.toBeArray();
			expect(context as Record<string, unknown>).toContainKey(randomKey);
		});
	});

	test("should load data from arguments", async () => {
		expect(await loadContext(envData, {})).toStrictEqual(expected);
	});

	test("should load data from a JSON file", async () => {
		const string = JSON.stringify(jsonData);
		const dataFile = await tempfile(string);
		expect(await loadContext([], { dataFile })).toStrictEqual(expected);
	});

	test("should load data from a .env file and ignore comments", async () => {
		const dataFile = await tempfile(envData.join("\n"));
		expect(await loadContext([], { dataFile })).toStrictEqual(expected);
	});

	test("should merge data in order: --from-env -> --data-file -> arguments (last wins)", async () => {
		const key1 = randomString();
		const key2 = randomString();
		const key3 = randomString();
		await mockEnv({
			[key1]: "env1",
			[key2]: "env2",
			[key3]: "env3",
		}, async () => {
			const json = { [key1]: "file1", [key2]: "file2" };
			const args = [`${key1}=arg1`];
			const dataFile = await tempfile(JSON.stringify(json));
			expect(await loadContext(args, { fromEnv: true, dataFile })).toStrictEqual({
				[key1]: "arg1",
				[key2]: "file2",
				[key3]: "env3",
			});
		});
	});
});

describe("toTemplifyOptions", () => {
	test("should pick only templify-related options", () => {
		const cmdOpts: Options = {
			key         : "key",
			open        : "open",
			close       : "close",
			fallback    : "fallback",
			depth       : -1,
			keyPattern  : "deep",
			dataFile    : "dataFile",
			fromEnv     : true,
			compact     : true,
			template    : "dataFile",
			templateFile: "dataFile",
		};
		const opts = toTemplifyOptions(cmdOpts);
		expect(opts.key).toBe(cmdOpts.key);
		expect(opts.open).toBe(cmdOpts.open);
		expect(opts.close).toBe(cmdOpts.close);
		expect(opts.fallback).toBe(cmdOpts.fallback);
		expect(opts.depth).toBe(cmdOpts.depth);
		expect(opts).toContainKey("spacing");
		expect(opts).not.toContainAnyKeys(["keyPattern", "dataFile", "fromEnv", "compact", "template", "templateFile"]);
	});

	test("should normalize spacing options", () => {
		const getSpacingOpts = (opts: Options = {}) => {
			const spacing = toTemplifyOptions(opts).spacing;
			expect(spacing).not.toBeArray();
			expect(spacing).toBeTypeOf("object");
			return spacing as tply.SpacingOptions;
		};

		expect(getSpacingOpts().size).toBeUndefined();
		expect(getSpacingOpts().size).toBeUndefined();
		expect(getSpacingOpts({ spacingSize: [1] }).size).toStrictEqual([1]);
		expect(getSpacingOpts({ spacingSize: [1, 3] }).size).toStrictEqual([1, 3]);
		expect(getSpacingOpts({ spacingStrict: true }).strict).toBeTrue();
	});

	test("should respect explicit key over keyPattern option", () => {
		expect(toTemplifyOptions({}).key).toBe(undefined);
		expect(toTemplifyOptions({ keyPattern: "x" }).key).toBe(undefined);
		expect(toTemplifyOptions({ keyPattern: "deep" }).key).toBe(tply.KEY_PATTERNS.DEEP);
		expect(toTemplifyOptions({ key: "key", keyPattern: "x" }).key).toBe("key");
		expect(toTemplifyOptions({ key: "key", keyPattern: "deep" }).key).toBe("key");
	});

	test("should infer deep key pattern based on depth option", () => {
		expect(toTemplifyOptions({}).key).toBe(undefined);
		expect(toTemplifyOptions({ depth: -1 }).key).toBe(tply.KEY_PATTERNS.DEEP);
		expect(toTemplifyOptions({ depth: 0 }).key).toBe(undefined);
		expect(toTemplifyOptions({ depth: 1 }).key).toBe(undefined);
		expect(toTemplifyOptions({ depth: 2 }).key).toBe(tply.KEY_PATTERNS.DEEP);

		expect(toTemplifyOptions({ depth: -1, key: "xxx" }).key).toBe("xxx");
		expect(toTemplifyOptions({ depth: 0, key: "xxx" }).key).toBe("xxx");
		expect(toTemplifyOptions({ depth: 1, key: "xxx" }).key).toBe("xxx");
		expect(toTemplifyOptions({ depth: 2, key: "xxx" }).key).toBe("xxx");

		expect(toTemplifyOptions({ depth: -1, keyPattern: "yyy" }).key).toBe(tply.KEY_PATTERNS.DEEP);
		expect(toTemplifyOptions({ depth: 0, keyPattern: "yyy" }).key).toBe(undefined);
		expect(toTemplifyOptions({ depth: 1, keyPattern: "yyy" }).key).toBe(undefined);
		expect(toTemplifyOptions({ depth: 2, keyPattern: "yyy" }).key).toBe(tply.KEY_PATTERNS.DEEP);

		expect(toTemplifyOptions({ depth: -1, keyPattern: "default" }).key).toBe(tply.KEY_PATTERNS.DEFAULT);
		expect(toTemplifyOptions({ depth: 0, keyPattern: "deep" }).key).toBe(tply.KEY_PATTERNS.DEEP);
		expect(toTemplifyOptions({ depth: 1, keyPattern: "deep" }).key).toBe(tply.KEY_PATTERNS.DEEP);
		expect(toTemplifyOptions({ depth: 2, keyPattern: "default" }).key).toBe(tply.KEY_PATTERNS.DEFAULT);
	});
});
