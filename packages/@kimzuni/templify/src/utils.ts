import type { Primitive, ContextValue, Context, CommonOptions, Keys, Placeholders, Groups } from "./types";
import { KEY_INDEX, KEY_PATTERNS } from "./constants";



export function getPattern(options: CommonOptions = {}) {
	const {
		key = KEY_PATTERNS.DEFAULT,
		open = "{",
		close = "}",
		spacing = {},
	} = options;

	const keyPattern = typeof key === "string" ? key : key.source;

	const {
		size: spacingSize = -1,
		strict: spacingStrict = false,
	} = typeof spacing === "number" || Array.isArray(spacing)
		? { size: spacing }
		: typeof spacing === "boolean"
			? { strict: spacing }
			: spacing;

	let leftSpace = "";
	const [innerSpaceMin, innerSpaceMax] = !Array.isArray(spacingSize)
		? [spacingSize, spacingSize]
		: spacingSize.length === 2
			? spacingSize
			: [spacingSize[0], spacingSize[0]];

	if (innerSpaceMin < 0 && innerSpaceMax < 0) {
		leftSpace = "\\s*";
	} else {
		const min = innerSpaceMin < 0 ? 0 : innerSpaceMin;
		const max = innerSpaceMax < 0 ? "" : innerSpaceMax;
		leftSpace = `\\s{${min},${max}}`;
	}

	const rightSpace = spacingStrict ? "\\1" : leftSpace;
	return new RegExp(`${open}(${leftSpace})(${keyPattern})${rightSpace}${close}`, "g");
}



export function parseData(template: string, pattern: RegExp) {
	const extract: Record<string, Set<string>> = {};
	const matchAll = template.matchAll(pattern);
	for (const [target, ...item] of matchAll) {
		const key = item[KEY_INDEX - 1];
		extract[key] ??= new Set();
		extract[key].add(target);
	}

	const groups: Groups = {};
	const keys: Keys = [];
	const placeholders: Placeholders = [];
	for (const key in extract) {
		const value = [...extract[key]];
		groups[key] = value;
		keys.push(key);
		placeholders.push(...value);
	}
	return { groups, keys, placeholders };
}



export function isQuote(char: string): char is "'" | "\"" {
	return char === "'" || char === "\"";
}

export function unquote(
	str: string,
	{
		strict = true,
	}: {
		strict?: boolean;
	} = {},
) {
	const first = str[0];
	const last = str[str.length - 1];
	if (strict) {
		if (!isQuote(first)) return str;
		if (first !== last) return str;
		return str.slice(1, -1);
	} else {
		return str.slice(
			isQuote(first) ? 1 : 0,
			isQuote(last) ? -1 : undefined,
		);
	}
}

export function getPaths(key: string) {
	const paths: string[] = [];

	let quote: "" | "'" | "\"" = "";
	let depth = 0;
	let startIdx = 0;
	let lastPushIdx = -1;
	for (let idx = 0; idx < key.length; idx++) {
		const char = key[idx];
		if (startIdx === idx && (char === " " || char === "\t")) {
			startIdx++;
			continue;
		}

		if (quote !== "") {
			if (char === quote) quote = "";
			continue;
		} else if (startIdx === idx && isQuote(char)) {
			quote = char;
			continue;
		}

		const prev = key[idx - 1];
		const isOpen = (depth === 0 && (char === "." || char === "["));
		const isClose = (depth === 1 && char === "]");
		if (isClose || (isOpen && prev !== "]")) {
			if (idx > 0) {
				paths.push(unquote(key.slice(startIdx, idx).trim()));
			}
			lastPushIdx = idx;
		}

		if (isOpen || isClose) {
			startIdx = idx + 1;
		}

		if (char === "[") {
			depth++;
		} else if (char === "]" && depth !== 0) {
			depth--;
		}
	}

	if (depth > 0 || lastPushIdx !== key.length - 1 || key[key.length - 1] === ".") {
		paths.push(unquote(
			key.slice(startIdx).trim(),
			{
				strict: quote === "",
			},
		));
	}

	return paths;
}

const KEY_PATHS_CACHE = new Map<string, string[]>();
export function getValue(context: Context, key: string, depth: number): Primitive {
	let paths = KEY_PATHS_CACHE.get(key);
	if (!paths) {
		paths = getPaths(key);
		KEY_PATHS_CACHE.set(key, paths);
	}

	let remainingDepth = depth;
	let value: Context | ContextValue = context;
	for (const currKey of paths) {
		if (!value || typeof value !== "object") {
			return undefined;
		} else if (remainingDepth === 0) {
			return undefined;
		}

		/* Arrays and Objects safely accept string keys in JS */
		// @ts-expect-error: ts(7053)
		value = value[currKey] as ContextValue;
		remainingDepth--;
	}

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
}



export function renderTemplate(
	template: string,
	context: Context,
	pattern: RegExp,
	depth = 1,
	fallback?: Primitive,
) {
	return template.replace(pattern, (target, ...args) => {
		const key = args[KEY_INDEX - 1] as string;
		const value = getValue(context, key, depth);
		return `${value !== undefined ? value : fallback !== undefined ? `${fallback}` : target}`;
	});
}
