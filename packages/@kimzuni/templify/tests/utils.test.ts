/* eslint-disable @stylistic/key-spacing */

import { describe, test, expect } from "bun:test";

import type { Groups } from "../src/types";
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
			spacing: true,
		}), [
			"{key}",
			"{ key }",
			"{  key  }",
			"{   key   }",
			"{    key    }",
		], [
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
		]);
		run(getPattern({
			spacing: {
				size: [1, 3, 4],
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
				size: [1, 3, 4],
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
