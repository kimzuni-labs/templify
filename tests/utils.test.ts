/* eslint-disable @typescript-eslint/no-floating-promises, @stylistic/key-spacing */

import assert from "node:assert";
import { describe, test } from "node:test";

import { getPattern, parseData } from "../src/utils";



describe("getPattern", () => {
	const run = (
		pattern: RegExp,
		matches: string[] = [],
		notMatches: string[] = [],
	) => {
		// remove global flag
		pattern = new RegExp(pattern.source);
		for (const item of matches) {
			assert.match(item, pattern);
		}
		for (const item of notMatches) {
			assert.doesNotMatch(item, pattern);
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
		], [
		]);
		run(getPattern({
			spacing: {
				count: -1,
			},
		}), [
			"{key}",
			"{ key }",
			"{  key  }",
			"{   key   }",
			"{    key    }",
			"{ key   }",
			"{   key }",
		], [
		]);
		run(getPattern({
			spacing: {
				count: 0,
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
		]);
		run(getPattern({
			spacing: {
				count: 2,
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
		]);
		run(getPattern({
			spacing: {
				count: [1, 3, 4],
			},
		}), [
			"{ key }",
			"{   key   }",
			"{    key    }",
			"{ key   }",
			"{   key }",
		], [
			"{key}",
			"{  key  }",
		]);
		run(getPattern({
			spacing: {
				strict: true,
				count: [1, 3, 4],
			},
		}), [
			"{ key }",
			"{   key   }",
			"{    key    }",
		], [
			"{key}",
			"{  key  }",
			"{ key   }",
			"{   key }",
		]);
	});
});

describe("parseData", () => {
	const run = (
		template: string,
		groups: ReturnType<typeof parseData>["groups"],
	) => {
		const keys = Object.keys(groups);
		const matches = Object.values(groups).flat();
		const data = parseData(template, getPattern({
			key: /\w+/,
		}));

		for (const key in data.groups) {
			assert.deepStrictEqual(
				data.groups[key].sort(),
				groups[key].sort(),
			);

			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete groups[key];
		}
		assert.ok(Object.keys(groups).length === 0);
		assert.deepStrictEqual(data.keys.sort(), keys.sort());
		assert.deepStrictEqual(data.matches.sort(), matches.sort());
	};

	test("groups/keys/matches", () => {
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
