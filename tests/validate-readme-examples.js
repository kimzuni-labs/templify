// This script validates README examples can be executed
// It's a simpler alternative to the TypeScript test suite for CI environments without tsx

const { compile, render } = require('../dist/index.cjs');

console.log('Testing README examples...\n');

let passed = 0;
let failed = 0;

function test(description, fn) {
	try {
		fn();
		console.log('✓', description);
		passed++;
	} catch (error) {
		console.error('✗', description);
		console.error('  ', error.message);
		failed++;
	}
}

function assertEqual(actual, expected, message) {
	if (actual !== expected) {
		throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
	}
}

// Test 1: Fallback with undefined
test('Fallback: undefined leaves unmatched placeholders unchanged', () => {
	const template = "{ key } / { key1 } / { key_2 }";
	const options = { key: /[a-z0-9]+/ };
	const data = { key1: "value1", key_2: "value2" };
	
	const result = render(template, data, {
		...options,
		fallback: undefined,
	});
	
	assertEqual(result, "{ key } / value1 / { key_2 }", "Fallback undefined test failed");
});

// Test 2: Fallback with string
test('Fallback: string replaces matched but missing keys', () => {
	const template = "{ key } / { key1 } / { key_2 }";
	const options = { key: /[a-z0-9]+/ };
	const data = { key1: "value1", key_2: "value2" };
	
	const result = render(template, data, {
		...options,
		fallback: "x",
	});
	
	assertEqual(result, "x / value1 / { key_2 }", "Fallback string test failed");
});

// Test 3: Fallback with null
test('Fallback: null replaces matched but missing keys with "null"', () => {
	const template = "{ key } / { key1 } / { key_2 }";
	const options = { key: /[a-z0-9]+/ };
	const data = { key1: "value1", key_2: "value2" };
	
	const result = render(template, data, {
		...options,
		fallback: null,
	});
	
	assertEqual(result, "null / value1 / { key_2 }", "Fallback null test failed");
});

// Test 4: Compile with default fallback
test('Compile: default fallback from options', () => {
	const template = "{ key } / { key1 } / { key_2 }";
	const options = { fallback: "fallback" };
	const data = { key1: "value1", key_2: "value2" };
	
	const c = compile(template, options);
	const result = c.render(data);
	
	assertEqual(result, "fallback / value1 / { key_2 }", "Compile default fallback test failed");
});

// Test 5: Compile with override undefined
test('Compile: override with undefined', () => {
	const template = "{ key } / { key1 } / { key_2 }";
	const options = { fallback: "fallback" };
	const data = { key1: "value1", key_2: "value2" };
	
	const c = compile(template, options);
	const result = c.render(data, { fallback: undefined });
	
	assertEqual(result, "{ key } / value1 / { key_2 }", "Compile override undefined test failed");
});

// Test 6: Compile with override string
test('Compile: override with string', () => {
	const template = "{ key } / { key1 } / { key_2 }";
	const options = { fallback: "fallback" };
	const data = { key1: "value1", key_2: "value2" };
	
	const c = compile(template, options);
	const result = c.render(data, { fallback: "x" });
	
	assertEqual(result, "x / value1 / { key_2 }", "Compile override string test failed");
});

// Test 7: Compile with override null
test('Compile: override with null', () => {
	const template = "{ key } / { key1 } / { key_2 }";
	const options = { fallback: "fallback" };
	const data = { key1: "value1", key_2: "value2" };
	
	const c = compile(template, options);
	const result = c.render(data, { fallback: null });
	
	assertEqual(result, "null / value1 / { key_2 }", "Compile override null test failed");
});

// Test 8: Key pattern validation
test('Key pattern: /[a-z0-9]+/ correctly filters keys', () => {
	const pattern = /[a-z0-9]+/;
	
	if (!pattern.test("key")) throw new Error("'key' should match");
	if (!pattern.test("key1")) throw new Error("'key1' should match");
	if (!pattern.test("key2")) throw new Error("'key2' should match");
	if (pattern.test("key_2")) throw new Error("'key_2' should NOT match (contains underscore)");
	if (pattern.test("Key")) throw new Error("'Key' should NOT match (contains uppercase)");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);