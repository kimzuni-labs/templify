/* eslint-disable @stylistic/key-spacing */

import { describe, test, expect } from "bun:test";

import type { Primitive, Context, Groups } from "../src/types";
import { getPattern, parseData, isQuote, unquote, getPaths, getValue, renderTemplate } from "../src/utils";
import { KEY_PATTERNS } from "../src/constants";



describe("getPattern", () => {
	const run = (
		pattern: RegExp,
		matches: string[] = [],
		notMatches: string[] = [],
	) => {
		// remove global flag
		pattern = new RegExp(pattern.source);
		for (const item of matches) {
			expect(item).toMatch(pattern);
		}
		for (const item of notMatches) {
			expect(item).not.toMatch(pattern);
		}
	};

	test("open/close", () => {
		run(getPattern({
			open: "{",
			close: "}",
		}), [
			"{ key1 }",
			"{{ key1 }}",
		], [
			"<%= key1 %>",
		]);
		run(getPattern({
			open: "{{",
			close: "}}",
		}), [
			"{{ key1 }}",
		], [
			"{ key1 }",
			"<%= key1 %>",
		]);
		run(getPattern({
			open: "<%=",
			close: "%>",
		}), [
			"<%= key1 %>",
		], [
			"{ key1 }",
			"{{ key1 }}",
		]);
		run(getPattern({
			open: "<?",
			close: "?>",
		}), [
		], [
			"{ key1 }",
			"{{ key1 }}",
			"<%= key1 %>",
		]);
	});

	test("key", () => {
		run(getPattern({
			key: /\w+/,
		}), [
			"{ key }",
			"{ Key }",
			"{ key1 }",
			"{ key_1 }",
		], [
			"{ key-1 }",
		]);
		run(getPattern({
			key: /[a-z]+/,
		}), [
			"{ key }",
		], [
			"{ Key }",
			"{ key1 }",
			"{ key_1 }",
			"{ key-1 }",
		]);
		run(getPattern({
			key: /[a-zA-Z0-9_-]+/,
		}), [
			"{ key }",
			"{ Key }",
			"{ key1 }",
			"{ key_1 }",
			"{ key-1 }",
		], [
			"{ key.1 }",
		]);
	});

	test("spacing", () => {
		run(getPattern({
			spacing: -1,
		}), [
			"{key}",
			"{ key }",
			"{  key  }",
			"{   key   }",
			"{    key    }",
			"{ key   }",
			"{   key }",
			"{    key   }",
		], [
		]);
		run(getPattern({
			spacing: true,
		}), [
			"{key}",
			"{ key }",
			"{  key  }",
			"{   key   }",
			"{    key    }",
		], [
			"{ key   }",
			"{   key }",
			"{    key   }",
		]);
		run(getPattern({
			spacing: {
				size: -1,
			},
		}), [
			"{key}",
			"{ key }",
			"{  key  }",
			"{   key   }",
			"{    key    }",
			"{ key   }",
			"{   key }",
			"{    key   }",
		], [
		]);
		run(getPattern({
			spacing: {
				size: 0,
			},
		}), [
			"{key}",
		], [
			"{ key }",
			"{  key  }",
			"{   key   }",
			"{    key    }",
			"{ key   }",
			"{   key }",
			"{    key   }",
		]);
		run(getPattern({
			spacing: {
				size: 2,
			},
		}), [
			"{  key  }",
		], [
			"{key}",
			"{ key }",
			"{   key   }",
			"{    key    }",
			"{ key   }",
			"{   key }",
			"{    key   }",
		]);
		run(getPattern({
			spacing: {
				size: [2],
			},
		}), [
			"{  key  }",
		], [
			"{key}",
			"{ key }",
			"{   key   }",
			"{    key    }",
			"{ key   }",
			"{   key }",
			"{    key   }",
		]);
		run(getPattern({
			spacing: {
				size: [1, 3],
			},
		}), [
			"{ key }",
			"{  key  }",
			"{   key   }",
			"{ key  }",
			"{ key   }",
			"{   key }",
		], [
			"{key}",
			"{    key   }",
		]);
		run(getPattern({
			spacing: {
				strict: true,
				size: [1, 3],
			},
		}), [
			"{ key }",
			"{  key  }",
			"{   key   }",
		], [
			"{key}",
			"{ key  }",
			"{ key   }",
			"{   key }",
			"{    key   }",
		]);

		expect(() => getPattern({
			spacing: {
				size: [3, 1],
			},
		})).toThrow();
	});
});

describe("parseData", () => {
	const run = (
		template: string,
		groups: Groups,
	) => {
		const keys = Object.keys(groups);
		const placeholders = Object.values(groups).flat();
		const data = parseData(template, getPattern({
			key: /\w+/,
		}));

		for (const key in data.groups) {
			expect(data.groups[key].sort()).toStrictEqual(groups[key].sort());

			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete groups[key];
		}
		expect(groups).toBeEmptyObject();
		expect(data.keys.sort()).toStrictEqual(keys.sort());
		expect(data.placeholders.sort()).toStrictEqual(placeholders.sort());
	};

	test("keys/placeholders/groups", () => {
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

test("isQuote", () => {
	expect(isQuote("'")).toBe(true);
	expect(isQuote("\"")).toBe(true);
	expect(isQuote("\\'")).toBe(false);
	expect(isQuote("x")).toBe(false);
	expect(isQuote("")).toBe(false);
});

describe("unquote", () => {
	test("no quotes", () => {
		expect(unquote("xx")).toBe("xx");
	});

	test("single", () => {
		expect(unquote("'xx'")).toBe("xx");
		expect(unquote("'x'x'")).toBe("x'x");
	});

	test("double", () => {
		expect(unquote("\"xx\"")).toBe("xx");
		expect(unquote("\"x\"x\"")).toBe("x\"x");
	});

	test("mixed", () => {
		expect(unquote("'xx\"")).toBe("'xx\"");
		expect(unquote("\"xx'")).toBe("\"xx'");
		expect(unquote("\"x'x\"")).toBe("x'x");
		expect(unquote("'x\"x'")).toBe("x\"x");
	});
});

describe("getPaths", () => {
	const run = (
		key: string,
		expected: string[],
	) => {
		expect(getPaths(key)).toStrictEqual(expected);
	};

	test("basic", () => {
		run(
			"abc",
			["abc"],
		);

		run(
			"a_b_c",
			["a_b_c"],
		);

		run(
			"a-b-c",
			["a-b-c"],
		);

		run(
			"a b c",
			["a b c"],
		);

		run(
			"1 2 3",
			["1 2 3"],
		);

		run(
			"가 나 다",
			["가 나 다"],
		);
	});

	test("dot", () => {
		run(
			"1.2.3",
			["1", "2", "3"],
		);

		run(
			"a.b.c",
			["a", "b", "c"],
		);

		run(
			".a.b.c",
			["a", "b", "c"],
		);

		run(
			"a.b.c.",
			["a", "b", "c", ""],
		);

		run(
			".a.b.c.",
			["a", "b", "c", ""],
		);
	});

	test("brackets", () => {
		run(
			"1[2][3]",
			["1", "2", "3"],
		);

		run(
			"a[b][c]",
			["a", "b", "c"],
		);

		run(
			"[1][2][3]",
			["1", "2", "3"],
		);

		run(
			"[a][b][c]",
			["a", "b", "c"],
		);
	});

	test("mixed", () => {
		run(
			"a[b.c]",
			["a", "b.c"],
		);

		run(
			"a.[b.c]",
			["a", "", "b.c"],
		);

		run(
			"[a].b.c",
			["a", "b", "c"],
		);

		run(
			".[a].b.c.",
			["", "a", "b", "c", ""],
		);

		run(
			".a[b].c",
			["a", "b", "c"],
		);

		run(
			".a.[b].c",
			["a", "", "b", "c"],
		);

		run(
			"a.b[c]",
			["a", "b", "c"],
		);

		run(
			"a.b.[c]",
			["a", "b", "", "c"],
		);

		run(
			"a.b[[c]]",
			["a", "b", "[c]"],
		);

		run(
			"a[b[c]]",
			["a", "b[c]"],
		);

		run(
			"a[b[c].d]",
			["a", "b[c].d"],
		);

		run(
			"a[b[c]].d",
			["a", "b[c]", "d"],
		);
	});

	describe("special case", () => {
		test("quotes/whitespace in key", () => {
			run(
				"a[b c]",
				["a", "b c"],
			);

			run(
				"a['b c']",
				["a", "b c"],
			);

			run(
				"a[\"b c\"]",
				["a", "b c"],
			);

			run(
				"a['b c\"]",
				["a", "b c\"]"],
			);

			run(
				"a[ b c ]",
				["a", "b c"],
			);

			// tab instead of space
			run(
				"a[	b	c	]",
				["a", "b	c"],
			);

			run(
				"a[' b c ']",
				["a", " b c "],
			);

			run(
				"a[ 'b c'  ]",
				["a", "b c"],
			);

			run(
				"a[ b' 'c ]",
				["a", "b' 'c"],
			);

			run(
				"a['b.'c]",
				["a", "'b.'c"],
			);

			run(
				"a['b c]",
				["a", "b c]"],
			);

			run(
				"a['b.c].d[e.f']",
				["a", "b.c].d[e.f"],
			);

			run(
				"a['b.c].d[e.f'].g",
				["a", "b.c].d[e.f", "g"],
			);

			run(
				"a['b.c].d[e.f]",
				["a", "b.c].d[e.f]"],
			);

			run(
				"a['b.c].d[e.f].g",
				["a", "b.c].d[e.f].g"],
			);
		});

		test("special chracter in key", () => {
			run(
				"a.b&c",
				["a", "b&c"],
			);

			run(
				"a.b*c",
				["a", "b*c"],
			);

			run(
				"a.b?c",
				["a", "b?c"],
			);

			run(
				"a.b,c",
				["a", "b,c"],
			);

			run(
				"a.b;c",
				["a", "b;c"],
			);

			run(
				"a.b'c",
				["a", "b'c"],
			);

			run(
				"a.b>c",
				["a", "b>c"],
			);
		});
	});
});

describe("getValue", () => {
	const context: Context = {
		key1: 1,
		key2: [
			"item1",
			{
				key3: ["item2", 42, null, undefined],
			},
			"item3",
		],
	};

	const run = (
		context: Context,
		key: string,
		depth: number,
		expected: Primitive,
	) => {
		expect(getValue(context, key, depth)).toStrictEqual(expected);
	};

	test("basic", () => {
		run(
			context,
			"key1",
			-1,
			1,
		);

		run(
			context,
			"key2",
			-1,
			undefined,
		);

		run(
			context,
			"key3",
			-1,
			undefined,
		);

		run(
			context,
			"key4",
			-1,
			undefined,
		);
	});

	describe("nested", () => {
		test("dot", () => {
			run(
				context,
				"key2.0",
				-1,
				"item1",
			);

			run(
				context,
				"key2.1",
				-1,
				undefined,
			);

			run(
				context,
				"key2.1.key3",
				-1,
				undefined,
			);

			run(
				context,
				"key2.1.key3.1",
				-1,
				42,
			);
		});

		test("brackets", () => {
			run(
				context,
				"key2[1][key3][1]",
				-1,
				42,
			);

			run(
				context,
				"key2[1]['key3'][1]",
				-1,
				42,
			);

			run(
				context,
				"key2[1][\"key3\"][1]",
				-1,
				42,
			);

			run(
				context,
				"key2[1]['key3\"][1]",
				-1,
				undefined,
			);
		});

		test("mixed", () => {
			run(
				context,
				"key2.1[key3][1]",
				-1,
				42,
			);

			run(
				context,
				"key2[1].key3[1]",
				-1,
				42,
			);

			run(
				context,
				"key2[1][key3].1",
				-1,
				42,
			);

			run(
				context,
				"key2.1[key3].1",
				-1,
				42,
			);

			run(
				context,
				"key2[1].key3.1",
				-1,
				42,
			);
		});
	});

	test("depth", () => {
		const key = "key2[1].key3[1]";

		run(
			context,
			key,
			-1,
			42,
		);

		run(
			context,
			key,
			0,
			undefined,
		);

		run(
			context,
			key,
			1,
			undefined,
		);

		run(
			context,
			key,
			2,
			undefined,
		);

		run(
			context,
			key,
			3,
			undefined,
		);

		run(
			context,
			key,
			4,
			42,
		);

		run(
			context,
			key,
			5,
			42,
		);
	});
});

describe("renderTemplate", () => {
	const shallowKey = getPattern({ key: KEY_PATTERNS.SHALLOW });
	const deepKey = getPattern({ key: KEY_PATTERNS.DEEP });

	const run = (
		template: string,
		context: Context,
		pattern: RegExp,
		depth: number,
		fallback: Primitive,
		expected: string,
	) => {
		expect(renderTemplate(template, context, pattern, depth, fallback)).toBe(expected);
	};

	test("basic", () => {
		run(
			"{a} { b} { c } {d} {e}",
			{
				a: 1,
				b: "x",
				c: true,
				d: null,
				e: undefined,
			},
			shallowKey,
			1,
			undefined,
			"1 x true null {e}",
		);

		run(
			"{a} { b} { c } {d} {e}",
			{
				a: 1,
				b: "x",
				c: true,
				d: null,
				e: undefined,
			},
			shallowKey,
			1,
			null,
			"1 x true null null",
		);
	});

	test("nested", () => {
		run(
			"{a} {b.c} {d[e]}",
			{
				a: 0,
				b: { c: 1 },
				d: { e: 2 },
			},
			shallowKey,
			1,
			undefined,
			"0 {b.c} {d[e]}",
		);

		run(
			"{a} {b.c} {d[e]}",
			{
				a: 0,
				b: { c: 1 },
				d: { e: 2 },
			},
			deepKey,
			-1,
			undefined,
			"0 1 2",
		);

		run(
			"{a} {[b.c]} {d[e]}",
			{
				a: 0,
				"b.c": 1,
				"d.e": 2,
			},
			shallowKey,
			-1,
			undefined,
			"0 {[b.c]} {d[e]}",
		);

		run(
			"{a} {[b.c]} {d[e]}",
			{
				a: 0,
				"b.c": 1,
				"d.e": 2,
			},
			deepKey,
			-1,
			undefined,
			"0 1 {d[e]}",
		);
	});
});
