import { compile } from "./compile";
import type { Context, RenderOptions } from "./types";



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
