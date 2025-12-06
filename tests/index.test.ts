/* eslint-disable @typescript-eslint/no-floating-promises */

import assert from "node:assert";
import { describe, test } from "node:test";

import { compile, keys, matches, render } from "../dist/index.js";
import type { RenderOptions } from "../dist/index.js";



const template = "{ key1 } | {    key2  } - {  key3  } / { key1 } | {    key3 }";
const data = {
	key : "value",
	key1: "value1",
	key3: "value3",
};



type Callback = (template: string, options: RenderOptions) => [keys: string[], matches: string[], rendered: string];
const init = (label: string, callback: Callback) => {
	const run = (
		label: string,
		template: string,
		options: RenderOptions,
		allKeys: string[],
		allMatches: string[],
		rendered: string,
	) => test(label, () => {
		const result = callback(template, options);
		assert.deepStrictEqual(result[0], allKeys);
		assert.deepStrictEqual(result[1], allMatches);
		assert.equal(result[2], rendered);
	});

	describe(label, () => {
		describe("key", () => {
			run(
				"/[a-z]+/",
				"{ key } | { key2 } - { key3 } / { key } | { key3 }",
				{ key: /[a-z]+/ },
				["key"],
				["{ key }"],
				"value | { key2 } - { key3 } / value | { key3 }",
			);
		});

		describe("open, close", () => {
			run(
				"{{ ... }}",
				"{{ key1 }} | {{ key2 }} - {{ key3 }} / {{ key1 }} | {{ key3 }}",
				{ open: "{{", close: "}}" },
				["key1", "key2", "key3"],
				["{{ key1 }}", "{{ key2 }}", "{{ key3 }}"],
				"value1 | {{ key2 }} - value3 / value1 | value3",
			);
			run(
				"<=% ... =>",
				"<=% key1 => | {{ key2 }} - <=% key3 => / {{ key1 }} | {{ key3 }}",
				{ open: "<=%", close: "=>" },
				["key1", "key3"],
				["<=% key1 =>", "<=% key3 =>"],
				"value1 | {{ key2 }} - value3 / {{ key1 }} | {{ key3 }}",
			);
		});

		describe("spacing", () => {
			run(
				"strict: false",
				template,
				{ spacing: { strict: false } },
				["key1", "key2", "key3"],
				["{ key1 }", "{    key2  }", "{  key3  }", "{    key3 }"],
				"value1 | {    key2  } - value3 / value1 | value3",
			);
			run(
				"strict: true",
				template,
				{ spacing: { strict: true } },
				["key1", "key3"],
				["{ key1 }", "{  key3  }"],
				"value1 | {    key2  } - value3 / value1 | {    key3 }",
			);
			run(
				"count: -1",
				template,
				{ spacing: { count: -1 } },
				["key1", "key2", "key3"],
				["{ key1 }", "{    key2  }", "{  key3  }", "{    key3 }"],
				"value1 | {    key2  } - value3 / value1 | value3",
			);
			run(
				"count: [-1, 4]",
				template,
				{ spacing: { count: [-1, 4] } },
				["key1", "key2", "key3"],
				["{ key1 }", "{    key2  }", "{  key3  }", "{    key3 }"],
				"value1 | {    key2  } - value3 / value1 | value3",
			);
			run(
				"count: [1, 4]",
				template,
				{ spacing: { count: [1, 4] } },
				["key1", "key3"],
				["{ key1 }", "{    key3 }"],
				"value1 | {    key2  } - {  key3  } / value1 | value3",
			);
			run(
				"strict: true, count: [1, 4]",
				template,
				{ spacing: { strict: true, count: [1, 4] } },
				["key1"],
				["{ key1 }"],
				"value1 | {    key2  } - {  key3  } / value1 | {    key3 }",
			);
		});

		run(
			"fallback",
			template,
			{ fallback: "x" },
			["key1", "key2", "key3"],
			["{ key1 }", "{    key2  }", "{  key3  }", "{    key3 }"],
			"value1 | x - value3 / value1 | value3",
		);
	});
};



init("compile", (template, options) => {
	const c = compile(template, options);
	return [
		c.keys(),
		c.matches(),
		c.render(data),
	];
});

init("direct", (template, options) => {
	return [
		keys(template, options),
		matches(template, options),
		render(template, data, options),
	];
});
