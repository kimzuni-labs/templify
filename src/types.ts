/**
 * Allowed types for template replacement values.
 */
export type AllowValue = string | number | boolean | null | undefined;

/**
 * Data source used for template rendering.
 */
export type RenderData = AllowValue[] | Record<string, AllowValue>;

/**
 * Options for controlling the number of spaces inside template placeholders.
 *
 * Can be used in {@link CompileOptions} or {@link RenderOptions} to enforce
 * consistent spacing rules when matching or rendering templates.
 */
export interface SpacingOptions {
	/**
	 * Whether to enforce exact space rules strictly.
	 *
	 * When `true`, placeholders must have the same number of spaces
	 * on both sides of the key to be considered a valid match.
	 *
	 * @default false
	 */
	strict?: boolean;

	/**
	 * Number of spaces allowed inside the braces. Negative value disables space checking.
	 *
	 * - If a single number, exactly that many spaces are required.
	 * - If an array of numbers, any of the specified counts are allowed.
	 *
	 * @default -1
	 */
	count?: number | number[];
}

/**
 * Options that control how templates are parsed and compiled.
 */
export interface CommonOptions {
	/**
	 * Regex pattern defining valid characters for placeholder keys.
	 * This controls what is allowed between the opening and closing delimiters.
	 * Any regex flags (e.g., `i`, `g`) are ignored if provided.
	 *
	 * By default, `/\w+/` allows only letters (A-Z, a-z), digits (0-9), and underscores (_).
	 *
	 * @default /\w+/
	 *
	 * @example
	 *
	 * ```typescript
	 * const options = { key: /[a-z]+/ };
	 * const result = keys("{ key } { key1 }", options);
	 * console.log(result)
	 * // ["key"]
	 * ```
	 */
	key?: RegExp | string;

	/**
	 * Opening delimiter for placeholders.
	 *
	 * @default "{"
	 *
	 * @example
	 *
	 * ```typescript
	 * const options = { open: "{{", close: "}}" };
	 * const result = render("{{ key1 }} { key1 }", { key1: "value1" }, options);
	 * console.log(result)
	 * // "value1 { key1 }"
	 * ```
	 */
	open?: string;

	/**
	 * Closing delimiter for placeholders.
	 *
	 * @default "}"
	 *
	 * @example
	 *
	 * ```typescript
	 * const options = { open: "{{", close: "}}" };
	 * const result = render("{{ key1 }} { key1 }", { key1: "value1" }, options);
	 * console.log(result)
	 * // "value1 { key1 }"
	 * ```
	 */
	close?: string;

	/**
	 * Rules for controlling spacing inside placeholders.
	 * Can be provided as a simple `count` value or as a full {@link SpacingOptions} object.
	 *
	 * @default -1
	 *
	 * @example
	 *
	 * ```typescript
	 * function run(options) {
	 *   return render(
	 *     "{key1} { key1 } {  key1  } {   key1   } {   key1 }",
	 *     { key1: "value1" },
	 *     { spacing: options },
	 *   );
	 * };
	 *
	 * console.log( run(-1) ); // "value1 value1 value1 value1 value1"
	 * console.log( run(1) ); // "{key1} value1 {  key1  } {   key1   } {   key1 }"
	 * console.log( run({ count: [1, 3] }) ); // "{key1} value1 {  key1  } value1 value1"
	 * console.log( run({ strict: true, count: [1, 3] }) ); // "{key1} value1 {  key1  } value1 {   key1 }"
	 */
	spacing?: SpacingOptions["count"] | SpacingOptions;
}

/**
 * Options used during the rendering phase.
 *
 * Extends {@link CommonOptions} with additional behavior.
 */
export interface RenderOptions extends CommonOptions {
	/**
	 * Value to use when a template key is missing in the `data` object.
	 *
	 * - If `undefined`, the placeholder is left unchanged.
	 * - If set, the placeholder is replaced with this value.
	 *
	 * @default undefined
	 */
	fallback?: AllowValue;
}

export interface CompileOptions extends RenderOptions {}
