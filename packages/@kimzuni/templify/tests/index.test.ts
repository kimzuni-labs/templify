/* eslint-disable @typescript-eslint/no-confusing-void-expression, @stylistic/key-spacing */

import { describe, test, expect, beforeEach, afterEach, spyOn, type Mock } from "bun:test";

import type { RenderOptions, Context, Groups } from "../src/types";
import { KEY_PATTERNS } from "../src/constants";
import * as utils from "../src/utils";
import { compile } from "../src/compile";
import { render } from "../src/direct";



describe("compile", () => {
	describe("Lazy Evaluation & Caching", () => {
		let getPatternSpy: Mock<typeof utils.getPattern>;
		let parseDataSpy: Mock<typeof utils.parseData>;

		beforeEach(() => {
			getPatternSpy = spyOn(utils, "getPattern");
			parseDataSpy = spyOn(utils, "parseData");
		});

		afterEach(() => {
			getPatternSpy.mockRestore();
			parseDataSpy.mockRestore();
		});

		test("should not call parseData when compile is invoked", () => {
			compile("{key1} {key2}");
			expect(getPatternSpy).not.toHaveBeenCalled();
			expect(parseDataSpy).not.toHaveBeenCalled();
		});

		test("should call parseData exactly once upon first property access", () => {
			const c = compile("{key1} {key2}");
			const keys = c.keys;
			expect(getPatternSpy).toHaveBeenCalledTimes(1);
			expect(parseDataSpy).toHaveBeenCalledTimes(1);
			expect(keys).toEqual(["key1", "key2"]);
		});

		test("should cache the parsed data and call parseData only once across multiple accesses", () => {
			const c = compile("{key1} {key2}");

			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			c.keys;
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			c.placeholders;
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			c.groups;
			c.render({});
			expect(getPatternSpy).toHaveBeenCalledTimes(1);
			expect(parseDataSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe("methods", () => {
		test("keys/placeholders/groups", () => {
			const run = (
				template: string,
				groups: Groups,
			) => {
				const options = {};
				const c = compile(template, options);

				const keys = Object.keys(groups);
				const placeholders = Object.values(groups).flat();
				for (const key in c.groups) {
					expect(c.groups[key].sort()).toStrictEqual(groups[key].sort());

					// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
					delete groups[key];
				}
				expect(groups).toBeEmptyObject();
				expect(c.keys.sort()).toStrictEqual(keys.sort());
				expect(c.placeholders.sort()).toStrictEqual(placeholders.sort());
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
				expect(compile(template, options).keys.sort()).toStrictEqual(keys.sort());
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
				expect(compile(template, options).keys.sort()).toStrictEqual(keys.sort());
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
				const template = "{key} / { key } / {  key  } / {   key   } / {    key    } / { key  } / { key   } / {   key }";
				const options = { spacing };
				const data = compile(template, options);
				expect(data.placeholders.sort()).toStrictEqual(placeholders.sort());
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
					"{ key  }",
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
					"{ key  }",
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
				"size: [2]",
				{ size: [2] },
				[
					"{  key  }",
				],
			);
			run(
				"size: [1, 3]",
				{ size: [1, 3] },
				[
					"{ key }",
					"{  key  }",
					"{   key   }",
					"{ key  }",
					"{ key   }",
					"{   key }",
				],
			);
			run(
				"strict: true, size: [1, 3]",
				{ strict: true, size: [1, 3] },
				[
					"{ key }",
					"{  key  }",
					"{   key   }",
				],
			);
		});
	});
});

describe("compile.render and direct render", () => {
	describe("render", () => {
		const run = (
			label: string,
			options: RenderOptions,
			template: string,
			context: Context,
			renderResult: string,
		) => test(label, () => {
			const opts = { key: options.key, depth: options.depth };
			const result = render(template, context, { key: options.key, depth: options.depth });
			const expected = compile(template, opts).render(context);
			expect(renderResult).toBe(expected);
			expect(result).toBe(expected);
		});

		run(
			"json",
			{ key: KEY_PATTERNS.DEFAULT },
			"{ key } / { key1 } / { key2 } / { key1 }",
			{ key1: "value1" },
			"{ key } / value1 / { key2 } / value1",
		);

		run(
			"array",
			{ key: KEY_PATTERNS.DEFAULT },
			"{0}/{1}/{2}/{1}",
			["item1", "item2"],
			"item1/item2/{2}/item2",
		);

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

		run(
			"depth",
			{ key: KEY_PATTERNS.DEFAULT },
			"{ x }/{ a.b }/{a.c[0]}/{a.c.1.d}",
			context,
			"xxx/{ a.b }/{a.c[0]}/{a.c.1.d}",
		);

		run(
			"depth: -1",
			{ key: KEY_PATTERNS.DEEP, depth: -1 },
			"{ x }/{ a.b }/{a.c[0]}/{a.c.1.d}",
			context,
			"xxx/111/null/x",
		);

		run(
			"depth: 0",
			{ key: KEY_PATTERNS.DEEP, depth: 0 },
			"{ x }/{ a.b }/{a.c[0]}/{a.c.1.d}",
			context,
			"{ x }/{ a.b }/{a.c[0]}/{a.c.1.d}",
		);

		run(
			"depth: 1",
			{ key: KEY_PATTERNS.DEEP, depth: 1 },
			"{ x }/{ a.b }/{a.c[0]}/{a.c.1.d}",
			context,
			"xxx/{ a.b }/{a.c[0]}/{a.c.1.d}",
		);

		run(
			"depth: 3",
			{ key: KEY_PATTERNS.DEEP, depth: 3 },
			"{ x }/{ a.b }/{a.c[0]}/{a.c.1.d}",
			context,
			"xxx/111/null/{a.c.1.d}",
		);
	});

	describe("fallback", () => {
		test("normal", () => {
			const run = (
				fallback: RenderOptions["fallback"],
				renderResult: string,
			) => {
				const template = "{ key } / { key1 } / { key_1 } / { key2 }";
				const options = { key: /[a-z0-9]+/, fallback } satisfies RenderOptions;
				const context = { key: "value", key1: "value1" };
				const result = render(template, context, options);
				const expected = compile(template, options).render(context);
				expect(renderResult).toBe(expected);
				expect(result).toBe(expected);
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

		test("override", () => {
			const run = (
				fallback: RenderOptions["fallback"],
				render: string,
			) => {
				const template = "{ key } / { key1 } / { key_1 } / { key2 }";
				const options = { key: /[a-z0-9]+/, fallback: "fb" } satisfies RenderOptions;
				const context = { key: "value", key1: "value1" };
				const resutls = compile(template, options);
				expect(resutls.render(context, { fallback })).toBe(render);
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
});
