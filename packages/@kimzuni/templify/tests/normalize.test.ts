import { describe, test, expect } from "bun:test";

import {
	normalizeKeyPattern,
	normalizeOpen,
	normalizeClose,
	normalizeSpacing,
	normalizeFallback,
	normalizeDepth,
	normalizeOptions,
} from "../src/normalize";



describe("normalizeKeyPattern", () => {
	test("valid", () => {
		expect(normalizeKeyPattern(undefined)).toBeString();
		expect(normalizeKeyPattern("x")).toBeString();
		expect(normalizeKeyPattern(/x/)).toBeString();
	});

	test("invalid", () => {
		expect(() => normalizeKeyPattern(null)).toThrowError(TypeError);
		expect(() => normalizeKeyPattern(1)).toThrowError(TypeError);
	});
});

describe("normalizeOpen", () => {
	test("valid", () => {
		expect(normalizeOpen(undefined)).toBeString();
		expect(normalizeOpen("x")).toBeString();
	});

	test("invalid", () => {
		expect(() => normalizeOpen(null)).toThrowError(TypeError);
		expect(() => normalizeOpen(1)).toThrowError(TypeError);
	});
});

describe("normalizeClose", () => {
	test("valid", () => {
		expect(normalizeClose(undefined)).toBeString();
		expect(normalizeClose("x")).toBeString();
	});

	test("invalid", () => {
		expect(() => normalizeClose(null)).toThrowError(TypeError);
		expect(() => normalizeClose(1)).toThrowError(TypeError);
	});
});

describe("normalizeClose", () => {
	test("valid", () => {
		expect(normalizeClose(undefined)).toBeString();
		expect(normalizeClose("x")).toBeString();
	});

	test("invalid", () => {
		expect(() => normalizeClose(null)).toThrowError(TypeError);
		expect(() => normalizeClose(1)).toThrowError(TypeError);
	});
});

describe("normalizeSpacing", () => {
	test("valid", () => {
		expect(normalizeSpacing(undefined)).toBeObject();
		expect(normalizeSpacing(true)).toBeObject();
		expect(normalizeSpacing(false)).toBeObject();
		expect(normalizeSpacing(1)).toBeObject();
		expect(normalizeSpacing([])).toBeObject();
		expect(normalizeSpacing([1])).toBeObject();
		expect(normalizeSpacing([1, 2])).toBeObject();
		expect(normalizeSpacing({})).toBeObject();
		expect(normalizeSpacing({ strict: undefined })).toBeObject();
		expect(normalizeSpacing({ strict: true })).toBeObject();
		expect(normalizeSpacing({ strict: false })).toBeObject();
		expect(normalizeSpacing({ size: 1 })).toBeObject();
		expect(normalizeSpacing({ size: [] })).toBeObject();
		expect(normalizeSpacing({ size: [1] })).toBeObject();
		expect(normalizeSpacing({ size: [1, 2] })).toBeObject();
	});

	test("invalid", () => {
		expect(() => normalizeSpacing(null)).toThrowError(TypeError);
		expect(() => normalizeSpacing("")).toThrowError(TypeError);
		expect(() => normalizeSpacing("x")).toThrowError(TypeError);
		expect(() => normalizeSpacing({ strict: null })).toThrowError(TypeError);
		expect(() => normalizeSpacing({ strict: 1 })).toThrowError(TypeError);
		expect(() => normalizeSpacing({ size: null })).toThrowError(TypeError);
		expect(() => normalizeSpacing({ size: true })).toThrowError(TypeError);
		expect(() => normalizeSpacing({ size: false })).toThrowError(TypeError);
	});
});

describe("normalizeFallback", () => {
	test("valid", () => {
		expect(normalizeFallback(undefined)).toBeUndefined();
		expect(normalizeFallback(null)).toBe(null);
		expect(normalizeFallback(true)).toBe(true);
		expect(normalizeFallback(false)).toBe(false);
		expect(normalizeFallback(1)).toBe(1);
		expect(normalizeFallback("x")).toBe("x");
	});

	test("invalid", () => {
		expect(() => normalizeFallback([])).toThrowError(TypeError);
		expect(() => normalizeFallback({})).toThrowError(TypeError);
	});
});

describe("normalizeDepth", () => {
	test("valid", () => {
		expect(normalizeDepth(undefined)).toBeNumber();
		expect(normalizeDepth(1)).toBeNumber();
	});

	test("invalid", () => {
		expect(() => normalizeDepth(null)).toThrowError(TypeError);
		expect(() => normalizeDepth("x")).toThrowError(TypeError);
	});
});

describe("normalizeOptions", () => {
	test("valid", () => {
		expect(normalizeOptions(undefined)).toBeObject();
		expect(normalizeOptions({})).toBeObject();
		expect(normalizeOptions({ key: "x" })).toBeObject();
		expect(normalizeOptions({ open: "x" })).toBeObject();
		expect(normalizeOptions({ close: "x" })).toBeObject();
		expect(normalizeOptions({ spacing: {} })).toBeObject();
		expect(normalizeOptions({ fallback: "x" })).toBeObject();
		expect(normalizeOptions({ depth: 1 })).toBeObject();
	});

	test("invalid", () => {
		expect(() => normalizeOptions(null)).toThrowError(TypeError);
		expect(() => normalizeOptions(1)).toThrowError(TypeError);
		expect(() => normalizeOptions("x")).toThrowError(TypeError);
		expect(() => normalizeOptions([])).toThrowError(TypeError);
		expect(() => normalizeOptions({ key: 1 })).toThrowError(TypeError);
		expect(() => normalizeOptions({ open: 1 })).toThrowError(TypeError);
		expect(() => normalizeOptions({ close: 1 })).toThrowError(TypeError);
		expect(() => normalizeOptions({ spacing: "x" })).toThrowError(TypeError);
		expect(() => normalizeOptions({ fallback: [] })).toThrowError(TypeError);
		expect(() => normalizeOptions({ depth: "x" })).toThrowError(TypeError);
	});
});
