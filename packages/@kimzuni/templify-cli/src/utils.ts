import assert from "node:assert";
import fs from "node:fs/promises";
import dotenv from "dotenv";
import * as tply from "@kimzuni/templify";

import type { Options } from "./types";



export function capitalize(string: string) {
	return `${string[0]?.toUpperCase() ?? ""}${string.slice(1)}`;
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
	const processEnv = fromEnv ? { ...process.env } : {};

	let json: tply.Context = {};
	let envFileLines: string[] = [];
	if (dataFile !== undefined) {
		const text = await fs.readFile(dataFile, "utf-8").then(x => x.trim());
		if (text[0] === "{" || text[0] === "[") {
			json = JSON.parse(text) as tply.Context;
		} else {
			envFileLines = text.split("\n");
		}
	}

	const keyValues = dotenv.parse([...KEY_VALUE, ...envFileLines].join("\n"));
	return Object.assign(processEnv, json, keyValues);
}

/**
 * @param opts from {@link Options}
 * @returns to {@link tply.CompileOptions}
 */
export function toTemplifyOptions(opts: Options): tply.CompileOptions {
	const {
		open,
		close,
		fallback,
		depth,
		spacingSize: size,
		spacingStrict: strict,
	} = opts;

	let key: string | RegExp | undefined = opts.key;
	if (opts.key !== undefined) {
		key = opts.key;
	} else if (opts.keyPattern !== undefined) {
		key = tply.KEY_PATTERNS[opts.keyPattern.toUpperCase() as keyof typeof tply.KEY_PATTERNS];
	}

	const spacing: tply.CompileOptions["spacing"] = { strict, size };
	return { key, open, close, spacing, fallback, depth };
}
