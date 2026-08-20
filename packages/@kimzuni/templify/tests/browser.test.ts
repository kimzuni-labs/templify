import { beforeAll, describe, expect, test } from "bun:test";

import { existsSync } from "node:fs";
import { resolve } from "node:path";

import type { KEY_PATTERNS, compile, render } from "../src";



interface BrowserTemplify {
	KEY_PATTERNS: typeof KEY_PATTERNS;
	compile     : typeof compile;
	render      : typeof render;
}

const packageDir = resolve(import.meta.dir, "..");
const browserBundlePath = resolve(packageDir, "dist/browser/index.iife.js");

const buildBrowserBundle = () => {
	if (existsSync(browserBundlePath)) {
		return;
	}

	const result = Bun.spawnSync({
		cmd   : ["bun", "run", "build"],
		cwd   : packageDir,
		stdout: "pipe",
		stderr: "pipe",
	});

	if (result.exitCode !== 0) {
		throw new Error(`Failed to build browser bundle:\n${result.stderr.toString() || result.stdout.toString()}`);
	}
};

const loadBrowserBundle = async () => {
	const source = await Bun.file(browserBundlePath).text();

	// eslint-disable-next-line @typescript-eslint/no-implied-eval
	const runner = new Function(`${source}; return Templify;`) as () => BrowserTemplify;
	return runner();
};

describe("browser bundle", () => {
	let browserTemplify: BrowserTemplify;

	beforeAll(async () => {
		buildBrowserBundle();
		browserTemplify = await loadBrowserBundle();
	});

	test("exposes expected api", () => {
		expect(browserTemplify).toBeObject();
		expect(browserTemplify.KEY_PATTERNS.DEFAULT).toBeInstanceOf(RegExp);
		expect(browserTemplify.KEY_PATTERNS.SHALLOW).toBeInstanceOf(RegExp);
		expect(browserTemplify.KEY_PATTERNS.DEEP).toBeInstanceOf(RegExp);
		expect(browserTemplify.compile).toBeFunction();
		expect(browserTemplify.render).toBeFunction();
	});

	test("compile also works in iife output", () => {
		const template = "Hello, { name }!";
		const compiled = browserTemplify.compile(template);
		expect(compiled.render({ name: "browser" })).toBe("Hello, browser!");
	});

	test("renders deeply nested keys in iife output", () => {
		const template = "{ user.name }/{ users[0].name }";
		const context = {
			user : { name: "John" },
			users: [{ name: "Doe" }],
		};

		const output = browserTemplify.render(template, context, {
			key  : browserTemplify.KEY_PATTERNS.DEEP,
			depth: -1,
		});

		expect(output).toBe("John/Doe");
	});
});
