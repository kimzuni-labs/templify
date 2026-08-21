/**
 * ```
 * /\w+/ // [a-zA-Z0-9_]
 * ```
 */
export const SHALLOW = /\w+/;

/**
 * ```
 * /[\w.[\]]+/
 * ```
 */
export const DEEP = /[\w.[\]]+/;

/**
 * ```
 * DEEP
 * ```
 */
export const DEFAULT = DEEP;
