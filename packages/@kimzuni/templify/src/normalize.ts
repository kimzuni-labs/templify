import type { Primitive, SpacingSizeRange, NormalizedOptions } from "./types";
import { KEY_PATTERNS } from "./constants";



const maybeNumber = (value: unknown) => (
	value === undefined || typeof value === "number"
);

const isRange = (value: unknown): value is Partial<SpacingSizeRange> => (
	Array.isArray(value)
	&& maybeNumber(value[0])
	&& maybeNumber(value[1])
);

const isRecord = (value: unknown): value is Record<string, unknown> => (
	typeof value === "object" && value !== null && !Array.isArray(value)
);

const getTypeName = (value: unknown) => (
	value === null ? "null" : typeof value
);

const formatError = (name: string, type: string, received: unknown) => (
	new TypeError(`[templify] ${name} must be of type ${type}. Received ${getTypeName(received)}`)
);



export function normalizeKeyPattern(value: unknown): string {
	if (typeof value === "string") {
		return value;
	}
	if (value === undefined || value instanceof RegExp) {
		return (value ?? KEY_PATTERNS.DEFAULT).source;
	}
	throw formatError("key pattern", "string or RegExp", value);
}

export function normalizeOpen(value: unknown) {
	if (value === undefined) {
		return "{";
	}
	if (typeof value === "string") {
		return value;
	}
	throw formatError("open", "string", value);
}

export function normalizeClose(value: unknown) {
	if (value === undefined) {
		return "}";
	}
	if (typeof value === "string") {
		return value;
	}
	throw formatError("close", "string", value);
}

export function normalizeSpacing(value: unknown): NormalizedOptions["spacing"] {
	// default value
	const strict = false;
	const size: [number, number] = [0, -1];

	switch (typeof value) {
		case "undefined":
			return { strict, size };
		case "number":
			return {
				strict,
				size: [value, value],
			};
		case "boolean":
			return {
				strict: value,
				size,
			};
		default:
			if (isRange(value)) {
				return {
					strict,
					size: [value[0] ?? size[0], value[1] ?? value[0] ?? size[1]],
				};
			}
			if (isRecord(value)) {
				break;
			}
			throw formatError("spacing", "boolean, number, [min?: number, max?: number], or SpacingOptions", value);
	}

	if (value.strict !== undefined && typeof value.strict !== "boolean") {
		throw formatError("spacing.strict", "boolean", value);
	}

	let range: SpacingSizeRange;
	switch (typeof value.size) {
		case "undefined":
			range = size;
			break;
		case "number":
			range = [value.size, value.size];
			break;
		default:
			if (isRange(value.size)) {
				range = [value.size[0] ?? size[0], value.size[1] ?? value.size[0] ?? size[1]];
				break;
			}
			throw formatError("spacing.size", "number or [min?: number, max?: number]", value);
	}

	return {
		strict: value.strict ?? false,
		size  : range,
	};
}

export function normalizeFallback(value: unknown): Primitive {
	switch (typeof value) {
		case "string":
		case "number":
		case "boolean":
		case "undefined":
			return value;
		case "object":
			if (value === null) {
				return null;
			}
	}

	throw formatError("fallback", "string, number, boolean, null, or undefined", value);
}

export function normalizeDepth(value: unknown) {
	if (value === undefined) {
		return -1;
	}
	if (typeof value === "number") {
		return value;
	}
	throw formatError("depth", "number", value);
}



export function normalizeOptions(opts: unknown = {}): NormalizedOptions {
	if (!isRecord(opts)) {
		throw formatError("options", "plain object", opts);
	}

	const {
		key,
		open,
		close,
		spacing,
		fallback,
		depth,
	} = opts;

	return {
		key     : normalizeKeyPattern(key),
		open    : normalizeOpen(open),
		close   : normalizeClose(close),
		spacing : normalizeSpacing(spacing),
		fallback: normalizeFallback(fallback),
		depth   : normalizeDepth(depth),
	};
}
