import { compile } from "./compile";
import type { Context, CommonOptions, RenderOptions } from "./types";



/**
 * Extracts a mapping of each placeholder key to all its matched template strings.
 *
 * For more advanced or repeated usage, consider using {@link compile} to precompile the template.
 *
 * @example
 *
 * ```typescript
 * const result = groups("{key1} { key1 } { key2}", { open: "{", close: "}", spacing: -1 });
 * console.log(result); // { key1: ["{key1}", "{ key1 }"], key2: ["{ key2}"] }
 * ```
 */
export function groups(template: string, options?: CommonOptions) {
	return compile(template, options).groups();
}

/**
 * Extracts a list of unique placeholder keys found in the given template string.
 *
 * For more advanced or repeated usage, consider using {@link compile} to precompile the template.
 *
 * @example
 *
 * ```typescript
 * const result = keys("{key1} { key1 } { key2}", { open: "{", close: "}", spacing: -1 });
 * console.log(result); // ["key1", "key2"]
 * ```
 */
export function keys(template: string, options?: CommonOptions) {
	return compile(template, options).keys();
}

/**
 * Extracts all matched placeholder strings from the given template.
 *
 * For more advanced or repeated usage, consider using {@link compile} to precompile the template.
 *
 * @example
 *
 * ```typescript
 * const result = matches("{key1} { key1 } { key2}", { open: "{", close: "}", spacing: -1 });
 * console.log(result); // ["{key1}", "{ key1 }", "{ key2}"]
 * ```
 */
export function matches(template: string, options?: CommonOptions) {
	return compile(template, options).matches();
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
 * console.log(result); // value1 value1 x
 * ```
 */
export function render(template: string, context: Context, options?: RenderOptions) {
	return compile(template, options).render(context);
}
