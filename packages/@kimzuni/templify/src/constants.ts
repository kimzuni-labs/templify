export const KEY_INDEX = 2;

export const KEY_PATTERNS = {
	/**
	 * ```
	 * /\w+/ // [a-zA-Z0-9_]
	 * ```
	 */
	SHALLOW: /\w+/,

	/**
	 * ```
	 * /[\w.[\]]+/
	 * ```
	 */
	DEEP: /[\w.[\]]+/,

	/**
	 * ```
	 * DEEP
	 * ```
	 */
	get DEFAULT() {
		return this.DEEP;
	},
};
