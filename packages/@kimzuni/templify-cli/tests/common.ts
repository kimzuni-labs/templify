import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";



export const randomString = ({
	prefix = "",
	suffix = "",
}: {
	prefix?: string;
	suffix?: string;
} = {}) => `${prefix}${Bun.randomUUIDv7("hex")}${suffix}`;

export const tempdir = path.join(os.tmpdir(), `templify-tests-${randomString()}`);
export const tempfile = async (stringOrOpts: string | {
	string?: string;
	prefix?: string;
	suffix?: string;
} = {}) => {
	const {
		string,
		prefix = "",
		suffix = "",
	} = typeof stringOrOpts === "string" ? { string: stringOrOpts } : stringOrOpts;
	const filepath = path.join(tempdir, randomString({ prefix, suffix }));
	if (string !== undefined) await fs.writeFile(filepath, string);
	return filepath;
};



export async function mkdtemp() {
	const dirname = await fs.mkdtemp(path.join(os.tmpdir(), "templify-tests-"));
	const cleanup = () => fs.rm(dirname, { recursive: true });
	return { dirname, cleanup };
}



export const captureStack: CaptureFrame[] = [];
export interface CaptureFrame {
	exitCode: typeof process.exitCode;
	log     : unknown[][];
	error   : unknown[][];
}
export const stdoutToString = (value: CaptureFrame["log"]) => value.map(x => x.join(" ")).join("\n");
export async function capture<T>(cb: () => T | Promise<T>) {
	const frame: CaptureFrame = {
		exitCode: undefined,
		log     : [],
		error   : [],
	};
	captureStack.push(frame);

	const exitCode = process.exitCode;
	try {
		const result = await cb();
		frame.exitCode = process.exitCode;
		return { result, frame };
	} finally {
		process.exitCode = exitCode;
		captureStack.pop();
	}
}



export type Stream = string | Buffer;
export type Env = Record<string, string | undefined>;

/**
 * - if `isTTY` is `true`, like pipe/redirection
 * - if `isTTY` is `false`, like interactively
 */
export type CreateStdinProps = Partial<Pick<NodeJS.ReadStream, "isTTY" | "readable">>;

export const createStdin = (
	stream: Stream,
	props?: CreateStdinProps,

	// @ts-expect-error: ts(2740)
): typeof process.stdin => Object.assign(
	Readable.from(stream),
	{
		isTTY   : props?.isTTY ?? false,
		readable: props?.readable ?? true,
	},
);

// @ts-expect-error: ts(2740)
export const createStdout = (props?: CreateStdinProps): typeof process.stdout => createStdin("", props);

export async function mockStdin<T>(
	string: Stream | undefined,
	props: CreateStdinProps,
	cb: () => T | Promise<T>,
) {
	const stdin = process.stdin;

	if (string !== undefined) {
		process.stdin = createStdin(string, props);
	}

	try {
		return await cb();
	} finally {
		process.stdin = stdin;
	}
}

export async function mockStdout<T>(
	props: CreateStdinProps,
	cb: () => T | Promise<T>,
) {
	const stdout = process.stdout;

	process.stdout = createStdout(props);

	try {
		return await cb();
	} finally {
		process.stdout = stdout;
	}
}

export async function mockEnv<T>(env: Env, cb: () => T | Promise<T>) {
	const processEnv = process.env;
	try {
		process.env = env;
		return await cb();
	} finally {
		process.env = processEnv;
	}
}
