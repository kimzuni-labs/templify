import fs from "node:fs/promises";
import { mock, beforeAll, afterAll, spyOn } from "bun:test";

import { tempdir, captureStack } from "./common";



function spy() {
	// @ts-expect-error: ts(2322)
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	spyOn(process, "exit").mockImplementation(code => captureStack.at(-1)!.exitCode = code);
	spyOn(console, "log").mockImplementation((...args) => captureStack.at(-1)?.log.push(args));
	spyOn(console, "error").mockImplementation((...args) => captureStack.at(-1)?.error.push(args));

	// @ts-expect-error: ts(2345)
	spyOn(process.stdin, "isTTY").mockReturnValue(true);

	// @ts-expect-error: ts(2345)
	spyOn(process.stdout, "isTTY").mockReturnValue(true);
}

async function before() {
	await fs.mkdir(tempdir, { recursive: true });
	spy();
}
async function after() {
	await fs.rm(tempdir, { recursive: true });
	mock.restore();
}



beforeAll(before);
afterAll(after);
