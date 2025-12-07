/* eslint-disable @typescript-eslint/no-floating-promises, @stylistic/key-spacing */

import assert from "node:assert";
import { describe, test } from "node:test";

import type { RenderOptions, RenderData } from "../src/types";
import { compile } from "../src/compile";
import { keys, matches, groups, render } from "../src/direct";



type Callback = (
	template: string,
	options: RenderOptions,
	data: RenderData,
) => {
	keys: string[];
	matches: string[];
	groups: ReturnType<typeof groups>;
	render: string;
};

const init = (label: string, callback: Callback) => {
	describe(label, () => {
		describe("methods", () => {
			test("groups/keys/matches", () => {
				const run = (
					template: string,
					groups: ReturnType<Callback>["groups"],
				) => {
					const options = {};
					const data = {};
					const results = callback(template, options, data);

					const keys = Object.keys(groups);
					const matches = Object.values(groups).flat();
					for (const key in results.groups) {
						assert.deepStrictEqual(
							results.groups[key]?.sort(),
							groups[key]?.sort(),
						);

						// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
						delete groups[key];
					}
					assert.ok(Object.keys(groups).length === 0);
					assert.deepStrictEqual(results.keys.sort(), keys.sort());
					assert.deepStrictEqual(results.matches.sort(), matches.sort());
				};

				run(
					"{key}/{ key }/{  key  }/{ key }/{  key  }",
					{
						key: ["{key}", "{ key }", "{  key  }"],
					},
				);
				run(
					"{key}/{ key1 }/{  key1  }/{ key }/{  key  }",
					{
						key: ["{key}", "{ key }", "{  key  }"],
						key1: ["{ key1 }", "{  key1  }"],
					},
				);
				run(
					"{0}/{1}/{2}/{1}",
					{
						0: ["{0}"],
						1: ["{1}"],
						2: ["{2}"],
					},
				);
				run(
					"{0}/{1}/{2}/{ 1 }",
					{
						0: ["{0}"],
						1: ["{1}", "{ 1 }"],
						2: ["{2}"],
					},
				);
			});
		});

		describe("options", () => {
			describe("open/close", () => {
				const run = (
					options: RenderOptions,
					keys: string[],
				) => test(`${options.open} ... ${options.close}`, () => {
					const template = "{ key1 } / {{ key2 }} / <%= key3 %>";
					const data = {};
					assert.deepStrictEqual(
						callback(template, options, data).keys.sort(),
						keys.sort(),
					);
				});

				run(
					{ open: "{", close: "}" },
					["key1", "key2"],
				);
				run(
					{ open: "{{", close: "}}" },
					["key2"],
				);
				run(
					{ open: "<%=", close: "%>" },
					["key3"],
				);
				run(
					{ open: "<?", close: "?>" },
					[],
				);
			});

			describe("key", () => {
				const run = (
					pattern: RegExp,
					keys: string[],
				) => test(pattern.source, () => {
					const template = "{ key } / { Key } / { key1 } / { key_1 } / { key-1 }";
					const options = { key: pattern } satisfies RenderOptions;
					const data = {};
					assert.deepStrictEqual(
						callback(template, options, data).keys.sort(),
						keys.sort(),
					);
				});

				run(
					/\w+/,
					["key", "Key", "key1", "key_1"],
				);
				run(
					/[a-z]+/,
					["key"],
				);
				run(
					/[a-zA-Z0-9_-]+/,
					["key", "Key", "key1", "key_1", "key-1"],
				);
			});

			describe("spacing", () => {
				const run = (
					label: string,
					spacing: Exclude<RenderOptions["spacing"], undefined>,
					matches: string[],
				) => test(label, () => {
					const template = "{key} / { key } / {  key  } / {   key   } / {    key    } / { key   } / {   key }";
					const options = { spacing };
					const data = {};
					assert.deepStrictEqual(
						callback(template, options, data).matches.sort(),
						matches.sort(),
					);
				});

				run(
					"-1",
					-1,
					[
						"{key}",
						"{ key }",
						"{  key  }",
						"{   key   }",
						"{    key    }",
						"{ key   }",
						"{   key }",
					],
				);
				run(
					"size: -1",
					{ size: -1 },
					[
						"{key}",
						"{ key }",
						"{  key  }",
						"{   key   }",
						"{    key    }",
						"{ key   }",
						"{   key }",
					],
				);
				run(
					"size: 0",
					{ size: 0 },
					[
						"{key}",
					],
				);
				run(
					"size: 2",
					{ size: 2 },
					[
						"{  key  }",
					],
				);
				run(
					"size: [1, 3, 4]",
					{ size: [1, 3, 4] },
					[
						"{ key }",
						"{   key   }",
						"{    key    }",
						"{ key   }",
						"{   key }",
					],
				);
				run(
					"strict: true, size: [1, 3, 4]",
					{ strict: true, size: [1, 3, 4] },
					[
						"{ key }",
						"{   key   }",
						"{    key    }",
					],
				);
			});
		});

		describe("render", () => {
			const run = (
				label: string,
				template: string,
				data: RenderData,
				render: string,
			) => test(label, () => {
				assert.equal(callback(template, {}, data).render, render);
			});

			run(
				"json",
				"{ key } / { key1 } / { key2 } / { key1 }",
				{ key1: "value1" },
				"{ key } / value1 / { key2 } / value1",
			);

			run(
				"array",
				"{0}/{1}/{2}/{1}",
				["item1", "item2"],
				"item1/item2/{2}/item2",
			);
		});

		test("fallback", () => {
			const run = (
				fallback: RenderOptions["fallback"],
				render: string,
			) => {
				const template = "{ key } / { key1 } / { key_1 } / { key2 }";
				const options = { key: /[a-z0-9]+/, fallback } satisfies RenderOptions;
				const data = { key: "value", key1: "value1" };
				const resutls = callback(template, options, data);
				assert.equal(resutls.render, render);
			};

			run(
				undefined,
				"value / value1 / { key_1 } / { key2 }",
			);
			run(
				null,
				"value / value1 / { key_1 } / null",
			);
			run(
				"x",
				"value / value1 / { key_1 } / x",
			);
		});
	});
};



init("compile", (template, options, data) => {
	const c = compile(template, options);
	return {
		keys: c.keys(),
		matches: c.matches(),
		groups: c.groups(),
		render: c.render(data),
	};
});

init("direct", (template, options, data) => {
	return {
		keys: keys(template, options),
		matches: matches(template, options),
		groups: groups(template, options),
		render: render(template, data, options),
	};
});
