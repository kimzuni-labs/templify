import type { CommonOptions, Keys, Matches, Groups } from "./types";



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
		size: spacingSize = -1,
		strict: spacingStrict = false,
	} = typeof spacing === "number" || Array.isArray(spacing)
		? { size: spacing }
		: typeof spacing === "boolean"
			? { strict: spacing }
			: spacing;

	let leftSpace = "";
	const innerSpaceArray = Array.isArray(spacingSize) ? spacingSize : [spacingSize];
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

	const groups: Groups = {};
	const keys: Keys = [];
	const matches: Matches = [];
	for (const key in extract) {
		const value = [...extract[key]];
		groups[key] = value;
		keys.push(key);
		matches.push(...value);
	}
	return { groups, keys, matches };
}
