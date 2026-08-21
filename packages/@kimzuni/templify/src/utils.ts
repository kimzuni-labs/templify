import type { Primitive, ContextValue, Context, NormalizedOptions, Keys, Placeholders, Groups } from "./types";



export function getPattern({
	key,
	open,
	close,
	spacing,
}: Pick<NormalizedOptions, "key" | "open" | "close" | "spacing">) {
	const {
		size: [innerSpaceMin, innerSpaceMax],
		strict: spacingStrict,
	} = spacing;

	let leftSpace = "";
	if (innerSpaceMin <= 0 && innerSpaceMax < 0) {
		leftSpace = "\\s*";
	} else {
		const min = innerSpaceMin < 0 ? 0 : innerSpaceMin;
		const max = innerSpaceMax < 0 ? "" : innerSpaceMax;
		leftSpace = `\\s{${min},${max}}`;
	}

	const rightSpace = spacingStrict ? "\\1" : leftSpace;
	return new RegExp(`${open}(${leftSpace})(${key})${rightSpace}${close}`, "g");
}



export function parseData(template: string, pattern: RegExp) {
	const extract: Record<string, Set<string>> = {};
	const matchAll = template.matchAll(pattern);
	for (const match of matchAll) {
		const target = match[0];

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const key = match[2]!;
		extract[key] ??= new Set();
		extract[key].add(target);
	}

	const keys: Keys = [];
	const placeholders: Placeholders = [];
	const groups: Groups = {};
	for (const key in extract) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const value = [...extract[key]!];
		keys.push(key);
		placeholders.push(...value);
		groups[key] = value;
	}
	return { keys, placeholders, groups };
}



export function isQuote(char: unknown): char is "'" | "\"" {
	return char === "'" || char === "\"";
}

export function unquote(
	str: string,
	{
		strict,
	}: {
		strict: boolean;
	},
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
				paths.push(unquote(key.slice(startIdx, idx).trim(), { strict: true }));
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
	depth: number,
	fallback: Primitive,
) {
	return template.replace(pattern, (target, _, key: string) => {
		const value = getValue(context, key, depth);
		return `${value !== undefined ? value : fallback !== undefined ? `${fallback}` : target}`;
	});
}
