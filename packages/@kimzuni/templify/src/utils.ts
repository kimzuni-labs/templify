import type { ContextValue, Context, FlatContext, CommonOptions, Keys, Placeholders, Groups } from "./types";
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

export function flattenContext(
	context: Context,
	depth = 1,
	prefix: string[] = [],
	isArray = false,
	flatContext: FlatContext = {},
) {
	if (depth <= -1 || depth >= 1) {
		/* Allow string index access on both array and object for flexibility */
		// eslint-disable-next-line @typescript-eslint/no-for-in-array
		for (const key in context) {
			// @ts-expect-error: ts(7053)
			const value = context[key] as ContextValue;

			let currKeys: string[];
			if (!prefix.length) {
				currKeys = [key];
			} else {
				currKeys = prefix.map(x => `${x}.${key}`);
				if (isArray) {
					currKeys.push(...prefix.map(x => `${x}[${key}]`));
				}
			}

			if (Array.isArray(value)) {
				flattenContext(value, depth - 1, currKeys, true, flatContext);
			} else if (value && typeof value === "object") {
				flattenContext(value, depth - 1, currKeys, false, flatContext);
			} else {
				for (const curr of currKeys) {
					flatContext[curr] = value;
				}
			}
		}
	}
	return flatContext;
}
