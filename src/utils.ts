import type { CommonOptions } from "./types";



export const keyIdx = 2;

export function getPattern(options: CommonOptions = {}) {
	const {
		key = /\w+/,
		open = "{",
		close = "}",
		spacing = {},
	} = options;

	const keyPattern = typeof key === "string" ? key : key.source;

	const {
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		count: spacingCount = -1,

		size: spacingSize,
		strict: spacingStrict = false,
	} = typeof spacing === "number" || Array.isArray(spacing) ? { size: spacing } : spacing;
	const size = spacingSize ?? spacingCount;

	let leftSpace = "";
	const innerSpaceArray = Array.isArray(size) ? size : [size];
	for (const number of innerSpaceArray) {
		if (number < 0) {
			leftSpace = "\\s*";
			break;
		} else {
			leftSpace += `${leftSpace ? "|" : ""}\\s{${Math.floor(number)}}`;
		}
	}

	const rightSpace = spacingStrict ? "\\1" : leftSpace;
	return new RegExp(`${open}(?:(${leftSpace}))(${keyPattern})(?:${rightSpace})${close}`, "g");
}

export function parseData(template: string, pattern: RegExp) {
	const extract: Record<string, Set<string>> = {};
	const matchAll = template.matchAll(pattern);
	for (const [target, ...item] of matchAll) {
		const key = item[keyIdx - 1];
		extract[key] ??= new Set();
		extract[key].add(target);
	}

	const groups: Partial<Record<string, string[]>> = {};
	const keys: string[] = [];
	const matches: string[] = [];
	for (const key in extract) {
		const value = [...extract[key]];
		groups[key] = value;
		keys.push(key);
		matches.push(...value);
	}
	return { groups, keys, matches };
}
