/* eslint-disable @typescript-eslint/no-confusing-void-expression, @stylistic/key-spacing */

import { describe, test, expect } from "bun:test";

import type { RenderOptions, Context, OverrideOptions } from "../src/types";
import { compile } from "../src/compile";
import { keys, placeholders, fields, groups, render } from "../src/direct";



type Compiled = ReturnType<typeof compile>;
type CallbackData = { [K in keyof Compiled]: ReturnType<Compiled[K]> };
type Callback = (
	template: string,
	options: RenderOptions,
	context: Context,
	overrideOptions?: OverrideOptions,
) => CallbackData;

const init = (label: string, callback: Callback) => {
	describe(label, () => {
		describe("methods", () => {
			test("keys/placeholders/fields/groups", () => {
				const run = (
					template: string,
					groups: CallbackData["groups"],
				) => {
					const options = {};
					const context = {};
					const results = callback(template, options, context);

					const keys = Object.keys(groups);
					const placeholders = Object.values(groups).flat();
					for (const key in results.groups) {
						expect(results.groups[key].sort()).toStrictEqual(groups[key].sort());

						// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
						delete groups[key];
					}
					expect(groups).toBeEmptyObject();
					expect(results.keys.sort()).toStrictEqual(keys.sort());
					expect(results.placeholders.sort()).toStrictEqual(placeholders.sort());
					expect(results.fields.sort()).toStrictEqual(results.placeholders.sort());
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
					const context = {};
					expect(callback(template, options, context).keys.sort()).toStrictEqual(keys.sort());
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
					const context = {};
					expect(callback(template, options, context).keys.sort()).toStrictEqual(keys.sort());
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
					placeholders: string[],
				) => test(label, () => {
					const template = "{key} / { key } / {  key  } / {   key   } / {    key    } / { key   } / {   key }";
					const options = { spacing };
					const context = {};
					const data = callback(template, options, context);
					expect(data.placeholders.sort()).toStrictEqual(placeholders.sort());
					expect(data.fields.sort()).toStrictEqual(data.placeholders.sort());
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
					"true",
					true,
					[
						"{key}",
						"{ key }",
						"{  key  }",
						"{   key   }",
						"{    key    }",
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
				context: Context,
				render: string,
			) => test(label, () => {
				expect(callback(template, {}, context).render).toBe(render);
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

		describe("fallback", () => {
			test("normal", () => {
				const run = (
					fallback: RenderOptions["fallback"],
					render: string,
				) => {
					const template = "{ key } / { key1 } / { key_1 } / { key2 }";
					const options = { key: /[a-z0-9]+/, fallback } satisfies RenderOptions;
					const context = { key: "value", key1: "value1" };
					const resutls = callback(template, options, context);
					expect(resutls.render).toBe(render);
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

			if (label === "compile") {
				test("override", () => {
					const run = (
						fallback: RenderOptions["fallback"],
						render: string,
					) => {
						const template = "{ key } / { key1 } / { key_1 } / { key2 }";
						const options = { key: /[a-z0-9]+/, fallback: "fb" } satisfies RenderOptions;
						const context = { key: "value", key1: "value1" };
						const resutls = callback(template, options, context, { fallback });
						expect(resutls.render).toBe(render);
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
			}
		});
	});
};



init("compile", (template, options, context, overrideOptions) => {
	const c = compile(template, options);
	return {
		keys: c.keys(),
		placeholders: c.placeholders(),
		fields: c.fields(),
		groups: c.groups(),
		render: c.render(context, overrideOptions),
	};
});

init("direct", (template, options, context) => {
	return {
		keys: keys(template, options),
		placeholders: placeholders(template, options),
		fields: fields(template, options),
		groups: groups(template, options),
		render: render(template, context, options),
	};
});
