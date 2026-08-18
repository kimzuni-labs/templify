import type { Context, CompileOptions, OverrideOptions } from "./types";
import { getPattern, parseData, renderTemplate } from "./utils";



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
	const { fallback, depth } = options;

	let keyPattern: RegExp | undefined;
	const getKeyPattern = () => {
		keyPattern ??= getPattern(options);
		return keyPattern;
	};

	let data: ReturnType<typeof parseData> | undefined;
	const getData = () => {
		data ??= parseData(template, getKeyPattern());
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
		 * console.log(c.keys);
		 * [ 'key1', 'key2' ]
		 * ```
		 */
		get keys() {
			return getData().keys;
		},

		/**
		 * Extracts a list of unique placeholders from the provided template.
		 *
		 * @example
		 *
		 * ```typescript
		 * const c = compile("{key1} { key1 } { key2}");
		 * console.log(c.placeholders);
		 * [ '{key1}', '{ key1 }', '{ key2}' ]
		 * ```
		 */
		get placeholders() {
			return getData().placeholders;
		},

		/**
		 * Groups placeholders by their normalized key.
		 *
		 * @example
		 *
		 * ```typescript
		 * const c = compile("{key1} { key1 } { key2}");
		 * console.log(c.groups);
		 * { key1: [ '{key1}', '{ key1 }' ], key2: [ '{ key2}' ] }
		 * ```
		 */
		get groups() {
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
			return renderTemplate(
				template,
				context,
				getKeyPattern(),
				"depth" in options ? options.depth : depth,
				"fallback" in options ? options.fallback : fallback,
			);
		},
	};
}
