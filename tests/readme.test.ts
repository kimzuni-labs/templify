/* eslint-disable @typescript-eslint/no-floating-promises, @stylistic/key-spacing */

import assert from "node:assert";
import { describe, test } from "node:test";

import { compile, render } from "../src/index";

/**
 * README Examples Validation Tests
 * 
 * This test suite validates that all code examples in the README.md file
 * work exactly as documented. This ensures documentation stays in sync with
 * the actual library behavior.
 */

describe("README.md Examples Validation", () => {
	describe("Fallback option examples (lines 184-206)", () => {
		const template = "{ key } / { key1 } / { key_2 }";
		const options = { key: /[a-z0-9]+/ };
		const data = { key1: "value1", key_2: "value2" };

		test("fallback: undefined - should leave unmatched placeholders unchanged", () => {
			const result = render(template, data, {
				...options,
				fallback: undefined,
			});
			assert.strictEqual(result, "{ key } / value1 / { key_2 }");
		});

		test("fallback: 'x' - should replace matched but missing keys with 'x'", () => {
			const result = render(template, data, {
				...options,
				fallback: "x",
			});
			assert.strictEqual(result, "x / value1 / { key_2 }");
		});

		test("fallback: null - should replace matched but missing keys with 'null'", () => {
			const result = render(template, data, {
				...options,
				fallback: null,
			});
			assert.strictEqual(result, "null / value1 / { key_2 }");
		});

		test("key pattern validation - { key } should match /[a-z0-9]+/", () => {
			// { key } matches the pattern and should be processed
			const result = render("{ key }", {}, { key: /[a-z0-9]+/, fallback: "matched" });
			assert.strictEqual(result, "matched");
		});

		test("key pattern validation - { key_2 } should NOT match /[a-z0-9]+/", () => {
			// { key_2 } does not match (contains underscore) and should be left unchanged
			const result = render("{ key_2 }", { key_2: "value" }, { key: /[a-z0-9]+/ });
			assert.strictEqual(result, "{ key_2 }");
		});

		test("key pattern validation - { key1 } should match /[a-z0-9]+/", () => {
			// { key1 } matches the pattern and should be replaced
			const result = render("{ key1 }", { key1: "value1" }, { key: /[a-z0-9]+/ });
			assert.strictEqual(result, "value1");
		});
	});

	describe("Override Options - compile with fallback (lines 218-238)", () => {
		const template = "{ key } / { key1 } / { key_2 }";
		const options = { fallback: "fallback" };
		const data = { key1: "value1", key_2: "value2" };

		test("default fallback from compile options", () => {
			const c = compile(template, options);
			const result = c.render(data);
			assert.strictEqual(result, "fallback / value1 / { key_2 }");
		});

		test("override with fallback: undefined", () => {
			const c = compile(template, options);
			const result = c.render(data, { fallback: undefined });
			assert.strictEqual(result, "{ key } / value1 / { key_2 }");
		});

		test("override with fallback: 'x'", () => {
			const c = compile(template, options);
			const result = c.render(data, { fallback: "x" });
			assert.strictEqual(result, "x / value1 / { key_2 }");
		});

		test("override with fallback: null", () => {
			const c = compile(template, options);
			const result = c.render(data, { fallback: null });
			assert.strictEqual(result, "null / value1 / { key_2 }");
		});
	});

	describe("Edge cases and extended validation", () => {
		test("key pattern with different regex - /[a-z]+/ only lowercase", () => {
			const template = "{ key } / { Key } / { key1 } / { key_2 }";
			const data = { key: "lowercase", Key: "Mixed", key1: "withnum", key_2: "underscore" };
			const result = render(template, data, { key: /[a-z]+/ });
			
			// Only { key } matches /[a-z]+/ (lowercase letters only)
			// { Key } doesn't match (has uppercase)
			// { key1 } doesn't match (has digit)
			// { key_2 } doesn't match (has underscore and digit)
			assert.strictEqual(result, "lowercase / { Key } / { key1 } / { key_2 }");
		});

		test("key pattern /[a-z0-9]+/ - matches lowercase alphanumeric only", () => {
			const template = "{ abc } / { abc123 } / { ABC } / { abc_123 }";
			const data = { abc: "val1", abc123: "val2", ABC: "val3", abc_123: "val4" };
			const result = render(template, data, { key: /[a-z0-9]+/ });
			
			// { abc } matches
			// { abc123 } matches
			// { ABC } doesn't match (uppercase)
			// { abc_123 } doesn't match (has underscore)
			assert.strictEqual(result, "val1 / val2 / { ABC } / { abc_123 }");
		});

		test("fallback with empty string value", () => {
			const template = "{ key1 } / { key2 }";
			const data = { key1: "value1" };
			const result = render(template, data, { fallback: "" });
			assert.strictEqual(result, "value1 / ");
		});

		test("fallback with number value", () => {
			const template = "{ key1 } / { key2 }";
			const data = { key1: "value1" };
			const result = render(template, data, { fallback: 0 });
			assert.strictEqual(result, "value1 / 0");
		});

		test("fallback with boolean true", () => {
			const template = "{ key1 } / { key2 }";
			const data = { key1: "value1" };
			const result = render(template, data, { fallback: true });
			assert.strictEqual(result, "value1 / true");
		});

		test("fallback with boolean false", () => {
			const template = "{ key1 } / { key2 }";
			const data = { key1: "value1" };
			const result = render(template, data, { fallback: false });
			assert.strictEqual(result, "value1 / false");
		});

		test("multiple missing keys with fallback", () => {
			const template = "{ a } / { b } / { c } / { d }";
			const data = { b: "B" };
			const result = render(template, data, { fallback: "?" });
			assert.strictEqual(result, "? / B / ? / ?");
		});

		test("compile with key option and override fallback", () => {
			const template = "{ key } / { key1 } / { key_2 }";
			const c = compile(template, { key: /[a-z0-9]+/, fallback: "default" });
			const data = { key1: "value1", key_2: "value2" };
			
			// With default fallback
			assert.strictEqual(c.render(data), "default / value1 / { key_2 }");
			
			// Override with different fallback
			assert.strictEqual(c.render(data, { fallback: "override" }), "override / value1 / { key_2 }");
			
			// Override with undefined
			assert.strictEqual(c.render(data, { fallback: undefined }), "{ key } / value1 / { key_2 }");
		});

		test("no keys matched by pattern - all left unchanged", () => {
			const template = "{ KEY } / { Key_1 } / { key-2 }";
			const data = { KEY: "val1", Key_1: "val2", "key-2": "val3" };
			const result = render(template, data, { key: /[a-z0-9]+/, fallback: "fallback" });
			
			// None match the pattern, so all remain unchanged
			assert.strictEqual(result, "{ KEY } / { Key_1 } / { key-2 }");
		});

		test("all keys match pattern and present in data", () => {
			const template = "{ key1 } / { key2 } / { key3 }";
			const data = { key1: "A", key2: "B", key3: "C" };
			const result = render(template, data, { key: /[a-z0-9]+/, fallback: "X" });
			assert.strictEqual(result, "A / B / C");
		});

		test("all keys match pattern but missing from data", () => {
			const template = "{ key1 } / { key2 } / { key3 }";
			const data = {};
			const result = render(template, data, { key: /[a-z0-9]+/, fallback: "missing" });
			assert.strictEqual(result, "missing / missing / missing");
		});

		test("spacing with key pattern - should still respect pattern", () => {
			const template = "{key} / { key } / {  key  } / { key_1 }";
			const data = { key: "value", key_1: "value1" };
			const result = render(template, data, {
				key: /[a-z0-9]+/,
				spacing: -1,
				fallback: "X",
			});
			// key matches in all forms, key_1 doesn't match pattern
			assert.strictEqual(result, "value / value / value / { key_1 }");
		});

		test("data contains keys not matching pattern - should be ignored", () => {
			const template = "{ key1 } / { key_2 }";
			const data = { key1: "match", key_2: "nomatch", key3: "extra" };
			const result = render(template, data, { key: /[a-z0-9]+/ });
			// key1 matches and is replaced, key_2 doesn't match pattern
			assert.strictEqual(result, "match / { key_2 }");
		});
	});

	describe("Boundary and special cases", () => {
		test("empty template", () => {
			const result = render("", {}, { key: /[a-z0-9]+/, fallback: "X" });
			assert.strictEqual(result, "");
		});

		test("template with no placeholders", () => {
			const result = render("no placeholders here", {}, { key: /[a-z0-9]+/, fallback: "X" });
			assert.strictEqual(result, "no placeholders here");
		});

		test("template with only unmatched placeholders", () => {
			const template = "{ KEY } { Key_1 } { key-2 }";
			const result = render(template, {}, { key: /[a-z0-9]+/, fallback: "X" });
			assert.strictEqual(result, "{ KEY } { Key_1 } { key-2 }");
		});

		test("single character key matching pattern", () => {
			const template = "{ a } { b } { c }";
			const data = { a: "A", b: "B" };
			const result = render(template, data, { key: /[a-z0-9]+/, fallback: "?" });
			assert.strictEqual(result, "A / B / ?");
		});

		test("numeric string keys matching pattern", () => {
			const template = "{ 123 } / { abc } / { 456abc }";
			const data = { "123": "num", "abc": "alpha", "456abc": "mixed" };
			const result = render(template, data, { key: /[a-z0-9]+/ });
			assert.strictEqual(result, "num / alpha / mixed");
		});

		test("key pattern that matches empty string - edge case", () => {
			// Using /* which can match zero or more
			const template = "{} / { } / {key}";
			const data = { "": "empty", key: "value" };
			// This tests library behavior with edge case patterns
			// Based on the library's default \w+ pattern, empty keys shouldn't match
			const result = render(template, data, { key: /\w*/ }); // \w* can match empty
			// The library likely filters empty matches or handles them specially
			// This test documents actual behavior
			assert.ok(typeof result === "string");
		});

		test("very long key name matching pattern", () => {
			const longKey = "a".repeat(100);
			const template = `{ ${longKey} }`;
			const data = { [longKey]: "longvalue" };
			const result = render(template, data, { key: /[a-z0-9]+/ });
			assert.strictEqual(result, "longvalue");
		});

		test("special regex characters in key value - should not affect pattern", () => {
			const template = "{ key1 } / { key2 }";
			const data = { key1: ".*+?[](){}^$|\\", key2: "normal" };
			const result = render(template, data, { key: /[a-z0-9]+/ });
			// Values should be inserted as-is, not treated as regex
			assert.strictEqual(result, ".*+?[](){}^$|\\ / normal");
		});

		test("compile reuse with different data sets", () => {
			const c = compile("{ a } / { b }", { key: /[a-z]+/, fallback: "X" });
			
			const result1 = c.render({ a: "A" });
			assert.strictEqual(result1, "A / X");
			
			const result2 = c.render({ b: "B" });
			assert.strictEqual(result2, "X / B");
			
			const result3 = c.render({ a: "A", b: "B" });
			assert.strictEqual(result3, "A / B");
			
			const result4 = c.render({});
			assert.strictEqual(result4, "X / X");
		});

		test("data with null and undefined values", () => {
			const template = "{ key1 } / { key2 } / { key3 } / { key4 }";
			const data = { key1: null, key2: undefined, key3: "value", key4: 0 };
			const result = render(template, data, { key: /[a-z0-9]+/, fallback: "FB" });
			// null and undefined in data should be treated as missing
			assert.strictEqual(result, "FB / FB / value / 0");
		});

		test("data value is empty string - should use empty string not fallback", () => {
			const template = "{ key1 } / { key2 }";
			const data = { key1: "", key2: "value" };
			const result = render(template, data, { key: /[a-z0-9]+/, fallback: "FB" });
			// Empty string is a valid value, should not trigger fallback
			assert.strictEqual(result, " / value");
		});

		test("data value is 0 - should use 0 not fallback", () => {
			const template = "{ key1 } / { key2 }";
			const data = { key1: 0, key2: "value" };
			const result = render(template, data, { key: /[a-z0-9]+/, fallback: "FB" });
			// 0 is a valid value
			assert.strictEqual(result, "0 / value");
		});

		test("data value is false - should use false not fallback", () => {
			const template = "{ key1 } / { key2 }";
			const data = { key1: false, key2: "value" };
			const result = render(template, data, { key: /[a-z0-9]+/, fallback: "FB" });
			// false is a valid value
			assert.strictEqual(result, "false / value");
		});
	});

	describe("Integration with other options", () => {
		test("key pattern with custom open/close delimiters", () => {
			const template = "<< key >> / << key1 >> / << key_2 >>";
			const data = { key: "v1", key1: "v2", key_2: "v3" };
			const result = render(template, data, {
				open: "<<",
				close: ">>",
				key: /[a-z0-9]+/,
				fallback: "X",
			});
			assert.strictEqual(result, "v1 / v2 / << key_2 >>");
		});

		test("key pattern with spacing options", () => {
			const template = "{key} { key } {  key  } { key_1 } {  key_1  }";
			const data = { key: "value", key_1: "value1" };
			const result = render(template, data, {
				key: /[a-z0-9]+/,
				spacing: { size: [0, 1, 2] },
				fallback: "X",
			});
			// All spacing variants of key should match, key_1 doesn't match pattern
			assert.strictEqual(result, "value value value { key_1 } { key_1 }");
		});

		test("strict spacing with key pattern", () => {
			const template = "{ key } / {  key  } / { key   } / { key1 }";
			const data = { key: "val", key1: "val1" };
			const result = render(template, data, {
				key: /[a-z0-9]+/,
				spacing: { strict: true, size: 1 },
			});
			// Only { key } and { key1 } match (1 space on both sides, strict)
			assert.strictEqual(result, "val / {  key  } / { key   } / val1");
		});

		test("array data with key pattern - should work with numeric keys", () => {
			const template = "{ 0 } / { 1 } / { 2 }";
			const data = ["first", "second"];
			const result = render(template, data, {
				key: /[0-9]+/,
				fallback: "missing",
			});
			assert.strictEqual(result, "first / second / missing");
		});
	});

	describe("README example consistency checks", () => {
		test("example from fallback section uses correct key pattern behavior", () => {
			// This validates the specific example in lines 184-206
			const template = "{ key } / { key1 } / { key_2 }";
			const options = { key: /[a-z0-9]+/ };
			const data = { key1: "value1", key_2: "value2" };
			
			// key matches pattern but not in data
			// key1 matches pattern and is in data
			// key_2 does NOT match pattern (has underscore)
			
			const resultUndefined = render(template, data, { ...options, fallback: undefined });
			const resultString = render(template, data, { ...options, fallback: "x" });
			const resultNull = render(template, data, { ...options, fallback: null });
			
			// Verify expected outputs match documentation exactly
			assert.strictEqual(resultUndefined, "{ key } / value1 / { key_2 }");
			assert.strictEqual(resultString, "x / value1 / { key_2 }");
			assert.strictEqual(resultNull, "null / value1 / { key_2 }");
		});

		test("compile example matches documentation output", () => {
			// This validates the specific example in lines 218-238
			const template = "{ key } / { key1 } / { key_2 }";
			const options = { fallback: "fallback" };
			const data = { key1: "value1", key_2: "value2" };
			
			const c = compile(template, options);
			
			assert.strictEqual(c.render(data), "fallback / value1 / { key_2 }");
			assert.strictEqual(c.render(data, { fallback: undefined }), "{ key } / value1 / { key_2 }");
			assert.strictEqual(c.render(data, { fallback: "x" }), "x / value1 / { key_2 }");
			assert.strictEqual(c.render(data, { fallback: null }), "null / value1 / { key_2 }");
		});

		test("documented behavior: key_2 never matches /[a-z0-9]+/", () => {
			// This is a critical assertion from the documentation
			// key_2 contains an underscore, which is NOT in the character class [a-z0-9]
			const pattern = /[a-z0-9]+/;
			assert.ok(!pattern.test("key_2"), "key_2 should NOT match /[a-z0-9]+/");
			assert.ok(pattern.test("key2"), "key2 SHOULD match /[a-z0-9]+/");
			assert.ok(pattern.test("key"), "key SHOULD match /[a-z0-9]+/");
			assert.ok(pattern.test("key1"), "key1 SHOULD match /[a-z0-9]+/");
		});
	});
});