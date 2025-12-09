# README Example Test Coverage

This document describes the comprehensive test coverage added for the README.md documentation examples.

## Test Files Created

### 1. `tests/readme.test.ts`
A comprehensive TypeScript test suite using Node.js test runner that validates all code examples in README.md.

**Coverage:**
- Lines 184-206: Fallback option examples
- Lines 218-238: Override options with compile
- Extended edge cases and validation scenarios

**Test Categories:**

#### Fallback Option Examples (6 tests)
- Validates behavior with `fallback: undefined`, `fallback: "x"`, and `fallback: null`
- Tests key pattern matching: ensures `{ key }` matches `/[a-z0-9]+/` while `{ key_2 }` does not

#### Override Options with Compile (4 tests)
- Tests default fallback from compile options
- Tests override with `undefined`, string, and `null` values

#### Edge Cases and Extended Validation (12 tests)
- Different regex patterns: `/[a-z]+/` (lowercase only)
- Pattern `/[a-z0-9]+/` behavior with mixed cases
- Fallback with empty string, numbers, booleans
- Multiple missing keys
- Compile with key option and override
- Pattern matching edge cases

#### Boundary and Special Cases (13 tests)
- Empty templates
- Templates with no placeholders
- Single character keys
- Numeric keys
- Very long key names (100 chars)
- Special regex characters in values
- Compile reuse with different data sets
- Null/undefined values in data
- Falsy values (0, false, empty string)

#### Integration with Other Options (4 tests)
- Key pattern with custom open/close delimiters
- Key pattern with spacing options
- Strict spacing with key pattern
- Array data with numeric keys

#### README Example Consistency Checks (3 tests)
- Direct validation of fallback section examples
- Direct validation of compile section examples
- Pattern matching assertions

**Total: 43 comprehensive test cases**

### 2. `tests/validate-readme-examples.js`
A simpler JavaScript validation script that can run in CI environments without TypeScript tooling.

**Coverage:**
- 8 core validation tests covering the main README examples
- Can be run with: `node tests/validate-readme-examples.js` (after building the project)

## Key Testing Insights

### Pattern Matching Behavior
The tests extensively validate that the `/[a-z0-9]+/` pattern:
- ✓ Matches: `key`, `key1`, `key2`, `abc123`, `123`
- ✗ Does NOT match: `key_2`, `Key`, `KEY`, `key-1`, `key_1`

This is critical to understanding the README examples where `{ key_2 }` remains unchanged because underscore is not in the character class `[a-z0-9]`.

### Fallback Option Behavior
1. `fallback: undefined` - Leaves unmatched placeholders unchanged (default behavior)
2. `fallback: "string"` - Replaces missing keys that match the pattern
3. `fallback: null` - Replaces missing keys with the string "null"
4. Keys that don't match the pattern are NEVER replaced, regardless of fallback

### Override Options
Compile options can be overridden at render time:
- `compile(template, { fallback: "default" })` sets a default
- `c.render(data, { fallback: "override" })` overrides for that specific render

## Running the Tests

### TypeScript Test Suite
```bash
# Run all tests including README validation
npm test

# Run only README tests
NODE_ENV=test tsx --test tests/readme.test.ts
```

### JavaScript Validation Script
```bash
# Build the project first
npm run build

# Run validation
node tests/validate-readme-examples.js
```

## Why These Tests Matter

1. **Documentation Accuracy**: Ensures all code examples in README.md actually work as documented
2. **Regression Prevention**: Catches breaking changes that would invalidate documentation
3. **Behavior Clarification**: Tests document subtle behaviors like pattern matching and fallback interaction
4. **Confidence**: Developers can trust that examples are accurate and tested

## Changes to README.md

The tests validate the updated examples in the git diff:
- Corrected the template and data to properly demonstrate pattern matching
- Added `key` option to examples to show `/[a-z0-9]+/` pattern behavior
- Fixed expected outputs to match actual library behavior
- Clarified that `key_2` doesn't match the pattern due to underscore

## Test Maintenance

When updating README.md examples:
1. Update the corresponding tests in `tests/readme.test.ts`
2. Run the test suite to verify examples work correctly
3. Update line number references in test descriptions if structure changes
4. Ensure both TypeScript and JavaScript validation scripts stay in sync