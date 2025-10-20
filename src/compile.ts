import { keyIdx, getPattern, parseData } from "./utils";
import type { RenderData, CompileOptions } from "./types";



/**
 * Compiles a template string into a reusable template processor.
 *
 * @example
 *
 * ```typescript
 * const c = compile("{key1} { key1 } { key2}", { open: "{", close: "}", spacing: -1 });
 * ```
 */
export function compile(template: string, options: CompileOptions = {}) {
	const pattern = getPattern(options);
	const { fallback } = options;

	let data: ReturnType<typeof parseData> | undefined;
	const getData = () => {
		data ??= parseData(template, pattern);
		return data;
	};

	return {
		/**
		 * Extracts a mapping of each placeholder key to all its matched template strings.
		 *
		 * @example
		 *
		 * ```typescript
		 * const c = compile("{key1} { key1 } { key2}", { open: "{", close: "}", spacing: -1 });
		 * const result = c.groups();
		 * console.log(result); // { key1: ["{key1}", "{ key1 }"], key2: ["{ key2}"] }
		 * ```
		 */
		groups() {
			return getData().groups;
		},

		/**
		 * Extracts a list of unique placeholder keys found in the given template string.
		 *
		 * @example
		 *
		 * ```typescript
		 * const c = compile("{key1} { key1 } { key2}", { open: "{", close: "}", spacing: -1 });
		 * const result = c.keys();
		 * console.log(result); // ["key1", "key2"]
		 * ```
		 */
		keys() {
			return getData().keys;
		},

		/**
		 * Extracts all matched placeholder strings from the given template.
		 *
		 * @example
		 *
		 * ```typescript
		 * const c = compile("{key1} { key1 } { key2}", { open: "{", close: "}", spacing: -1 });
		 * const result = c.matches();
		 * console.log(result); // ["{key1}", "{ key1 }", "{ key2}"]
		 * ```
		 */
		matches() {
			return getData().matches;
		},

		/**
		 * Renders a template string by replacing placeholders with corresponding values from `data`.
		 *
		 * @example
		 *
		 * ```typescript
		 * const c = compile("{key1} {key1 } { key2}", { open: "{", close: "}", spacing: -1, fallback: "x" });
		 * const result = c.render({ key1: "value1", key3: "value3" });
		 * console.log(result); // value1 value1 x
		 * ```
		 */
		render(data: RenderData) {
			return template.replace(pattern, (target, ...args) => {
				const key = args[keyIdx - 1] as string;

				/* Allow string index access on both array and object for flexibility */
				// @ts-expect-error: ts(7053)
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				return `${data[key] !== undefined ? data[key] : fallback !== undefined ? `${fallback}` : target}`;
			});
		},
	};
}
