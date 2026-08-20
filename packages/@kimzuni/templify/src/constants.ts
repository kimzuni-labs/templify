export const KEY_INDEX = 2;

export const KEY_PATTERNS = {
	SHALLOW: /\w+/,
	DEEP   : /[\w.[\]]+/,

	/**
	 * ```
	 * DEEP
	 * ```
	 */
	get DEFAULT() {
		return this.DEEP;
	},
};
