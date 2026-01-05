import { keyIdx, getPattern, parseData } from "./utils";
import type { Context, CompileOptions, OverrideOptions } from "./types";



/**
 * Compiles a template string into a reusable template processor.
 *
 * @example
 *
 * ```typescript
 * const c = compile("{key1} { key1 } { key2}");
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
		 * Extracts a list of unique placeholder keys from the provided template string.
		 *
		 * @example
		 *
		 * ```typescript
		 * const c = compile("{key1} { key1 } { key2}");
		 * const result = c.keys();
		 * console.log(result);
		 * [ 'key1', 'key2' ]
		 * ```
		 */
		keys() {
			return getData().keys;
		},

		/**
		 * Extracts a list of unique placeholders from the provided template.
		 *
		 * @example
		 *
		 * ```typescript
		 * const c = compile("{key1} { key1 } { key2}");
		 * const result = c.placeholders();
		 * console.log(result);
		 * [ '{key1}', '{ key1 }', '{ key2}' ]
		 * ```
		 */
		placeholders() {
			return getData().placeholders;
		},


		/**
		 * Alias of `.placeholders()`.
		 */
		fields() {
			return getData().placeholders;
		},

		/**
		 * Groups placeholders by their normalized key.
		 *
		 * @example
		 *
		 * ```typescript
		 * const c = compile("{key1} { key1 } { key2}");
		 * const result = c.groups();
		 * console.log(result);
		 * { key1: [ '{key1}', '{ key1 }' ], key2: [ '{ key2}' ] }
		 * ```
		 */
		groups() {
			return getData().groups;
		},

		/**
		 * Renders a template string by replacing placeholders with corresponding values from context.
		 *
		 * @example
		 *
		 * ```typescript
		 * const c = compile("{key1} {key1 } { key2}");
		 * const result = c.render({ key1: "value1", key3: "value3" });
		 * console.log(result);
		 * // value1 value1 { key2}
		 * ```
		 */
		render(context: Context, options: OverrideOptions = {}) {
			const fb = "fallback" in options ? options.fallback : fallback;
			return template.replace(pattern, (target, ...args) => {
				const key = args[keyIdx - 1] as string;

				/* Allow string index access on both array and object for flexibility */
				// @ts-expect-error: ts(7053)
				// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
				return `${context[key] !== undefined ? context[key] : fb !== undefined ? `${fb}` : target}`;
			});
		},
	};
}
