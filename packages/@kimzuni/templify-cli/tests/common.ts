import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable, Writable } from "node:stream";



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
	stdout  : string;
	stderr  : string;
}

export const stdoutToString = (value: CaptureFrame["log"]) => value.map(x => x.join(" ")).join("\n");
export const frameStdoutToString = (frame: CaptureFrame) => frame.stdout || stdoutToString(frame.log);
export const frameStderrToString = (frame: CaptureFrame) => frame.stderr || stdoutToString(frame.error);

export async function capture<T>(cb: () => T | Promise<T>) {
	const frame: CaptureFrame = {
		exitCode: undefined,
		log     : [],
		error   : [],
		stdout  : "",
		stderr  : "",
	};
	captureStack.push(frame);

	const exitCode = process.exitCode;

	const stdout = process.stdout as unknown as { write?: (chunk: unknown, encoding?: unknown, cb?: unknown) => unknown };
	const stderr = process.stderr as unknown as { write?: (chunk: unknown, encoding?: unknown, cb?: unknown) => unknown };
	const stdoutWrite = typeof stdout.write === "function" ? stdout.write.bind(process.stdout) : undefined;
	const stderrWrite = typeof stderr.write === "function" ? stderr.write.bind(process.stderr) : undefined;

	const append = (target: "stdout" | "stderr", chunk: unknown, encoding?: unknown) => {
		let str = "";
		if (typeof chunk === "string") {
			str = chunk;
		} else if (chunk instanceof Uint8Array) {
			str = Buffer.from(chunk).toString(typeof encoding === "string" ? encoding : undefined);
		} else if (chunk != null) {
			str = String(chunk);
		}
		frame[target] += str;
	};

	// @ts-expect-error: process.stdout.write is writable in test environment
	if (stdoutWrite) process.stdout.write = ((chunk: unknown, encoding?: unknown, cb?: unknown) => {
		if (typeof encoding === "function") {
			cb = encoding;
			encoding = undefined;
		}
		append("stdout", chunk, encoding);
		if (typeof cb === "function") cb();
		return true;
	}) as never;

	// @ts-expect-error: process.stderr.write is writable in test environment
	if (stderrWrite) process.stderr.write = ((chunk: unknown, encoding?: unknown, cb?: unknown) => {
		if (typeof encoding === "function") {
			cb = encoding;
			encoding = undefined;
		}
		append("stderr", chunk, encoding);
		if (typeof cb === "function") cb();
		return true;
	}) as never;

	try {
		const result = await cb();
		frame.exitCode = process.exitCode;
		return { result, frame };
	} finally {
		process.exitCode = exitCode;

		// @ts-expect-error: restore
		if (stdoutWrite) process.stdout.write = stdoutWrite;
		// @ts-expect-error: restore
		if (stderrWrite) process.stderr.write = stderrWrite;

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
export const createStdout = (props?: CreateStdinProps): typeof process.stdout => Object.assign(
	new Writable({
		write(_chunk, _encoding, callback) {
			callback();
		},
	}),
	{
		isTTY   : props?.isTTY ?? false,
		readable: props?.readable ?? false,
	},
);

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
