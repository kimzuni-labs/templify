import { compile } from "./compile";
import type { Context, CommonOptions, RenderOptions } from "./types";



/**
 * Extracts a list of unique placeholder keys from the provided template string.
 *
 * For more advanced or repeated usage, consider using {@link compile} to precompile the template.
 *
 * @example
 *
 * ```typescript
 * const result = keys("{key1} { key1 } { key2}", { open: "{", close: "}", spacing: -1 });
 * console.log(result);
 * [ 'key1', 'key2' ]
 * ```
 */
export function keys(template: string, options?: CommonOptions) {
	return compile(template, options).keys();
}

/**
 * Extracts a list of unique placeholders from the provided template.
 *
 * For more advanced or repeated usage, consider using {@link compile} to precompile the template.
 *
 * @example
 *
 * ```typescript
 * const result = placeholders("{key1} { key1 } { key2}", { open: "{", close: "}", spacing: -1 });
 * console.log(result);
 * [ '{key1}', '{ key1 }', '{ key2}' ]
 * ```
 */
export function placeholders(template: string, options?: CommonOptions) {
	return compile(template, options).placeholders();
}

/**
 * Alias of {@link placeholders}
 */
export const fields = placeholders;

/**
 * Groups placeholders by their normalized key.
 *
 * For more advanced or repeated usage, consider using {@link compile} to precompile the template.
 *
 * @example
 *
 * ```typescript
 * const result = groups("{key1} { key1 } { key2}", { open: "{", close: "}", spacing: -1 });
 * console.log(result);
 * { key1: [ '{key1}', '{ key1 }' ], key2: [ '{ key2}' ] }
 * ```
 */
export function groups(template: string, options?: CommonOptions) {
	return compile(template, options).groups();
}

/**
 * Renders a template string by replacing placeholders with corresponding values from context.
 *
 * For more advanced or repeated usage, consider using {@link compile} to precompile the template.
 *
 * @example
 *
 * ```typescript
 * const result = render("{key1} { key1 } { key2}", { key1: "value1", key3: "value3" }, { open: "{", close: "}", spacing: -1, fallback: "x" });
 * console.log(result);
 * // value1 value1 x
 * ```
 */
export function render(template: string, context: Context, options?: RenderOptions) {
	return compile(template, options).render(context);
}
