import assert from "node:assert";
import fs from "node:fs/promises";
import type * as tply from "@kimzuni/templify";

import type { Options } from "./types";



export function capitalize(string: string) {
	return `${string[0].toUpperCase()}${string.slice(1)}`;
}

export function isNonInteractiveStdin(stream: NodeJS.ReadStream) {
	return stream.readable && !stream.isTTY;
}

export function isInteractiveStdin(stream: NodeJS.ReadStream) {
	return stream.readable && stream.isTTY;
}

export function readStream(stream: NodeJS.ReadStream) {
	return new Promise<string>((res, rej) => {
		let string = "";
		stream.setEncoding("utf-8");
		stream.on("data", (chunk: string) => {
			string += chunk;
		});
		stream.on("end", () => {
			res(string);
		});
		stream.on("error", rej);
	});
}



/**
 * If `TEMPLATE` is not used, add it to `KEY_VALUE`.
 *
 * @param TEMPLATE Template string from argument
 * @param KEY_VALUE Data source from argument
 * @param opts Command options
 * @returns Template string
 */
export async function loadTemplate(
	stream: NodeJS.ReadStream,
	TEMPLATE: string | undefined,
	KEY_VALUE: string[],
	opts: Options,
) {
	const { template, templateFile, stdin: allowStdin = true } = opts;
	let used;
	let text;

	if (allowStdin && isNonInteractiveStdin(stream)) {
		text = await readStream(stream);
	} else if (typeof template === "string") {
		text = template;
	} else if (templateFile !== undefined) {
		text = await fs.readFile(templateFile, "utf-8");
	} else if (TEMPLATE !== undefined) {
		used = true;
		text = TEMPLATE;
	} else if (allowStdin && isInteractiveStdin(stream)) {
		text = await readStream(stream);
	}
	assert(text !== undefined);

	if (TEMPLATE !== undefined && !used) KEY_VALUE.splice(0, 0, TEMPLATE);
	return text;
}

/**
 * @param KEY_VALUE Data source from argument
 * @param opts Command options
 */
export async function loadContext(KEY_VALUE: string[], opts: Options): Promise<tply.Context> {
	const { dataFile, fromEnv } = opts;
	const env = fromEnv ? { ...process.env } : {};

	let json: tply.Context = {};
	if (dataFile !== undefined) {
		const text = await fs.readFile(dataFile, "utf-8").then(x => x.trim());
		if (["{", "["].includes(text[0])) {
			json = JSON.parse(text) as tply.Context;
		} else {
			KEY_VALUE = text.split("\n").concat(KEY_VALUE);
		}
	}

	const keyValues: Record<string, string> = {};
	for (let curr of KEY_VALUE) {
		const idx = curr.indexOf("#");
		if (idx !== -1) curr = curr.slice(0, idx).trimEnd();
		const split = curr.split("=");
		const key = split.shift()?.trim();
		let value = split.join("=").trim();
		const hasQuote = ["\"", "'", "`"].includes(value[0]);
		if (hasQuote) value = value.slice(1, -1);
		if (key) keyValues[key] = value;
	}

	return Object.assign(env, json, keyValues);
}

/**
 * @param opts from {@link Options}
 * @returns to {@link tply.CompileOptions}
 */
export function toTemplifyOptions(opts: Options): tply.CompileOptions {
	const {
		key,
		open,
		close,
		fallback,
		spacingSize: size,
		spacingStrict: strict,
	} = opts;
	const spacing: tply.CompileOptions["spacing"] = { strict, size };
	return { key, open, close, spacing, fallback };
}
