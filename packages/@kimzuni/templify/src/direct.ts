import { getPattern, flattenContext, renderTemplate } from "./utils";
import type { Context, RenderOptions } from "./types";



/**
 * Renders a template string by replacing placeholders with corresponding values from context.
 *
 * For more advanced or repeated usage, consider using `compile` to precompile the template.
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
	return renderTemplate(
		template,
		flattenContext(context, options?.depth),
		getPattern(options),
		options?.fallback,
	);
}
