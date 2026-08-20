import fs from "node:fs/promises";
import { type Mock, beforeAll, afterAll, spyOn } from "bun:test";

import { tempdir, captureStack } from "./common";



// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mocks: Array<Mock<(...args: any[]) => any>> = [];

function spy() {
	mocks.push(spyOn(console, "log").mockImplementation((...args) => captureStack.at(-1)?.log.push(args)));
	mocks.push(spyOn(console, "error").mockImplementation((...args) => captureStack.at(-1)?.error.push(args)));

	mocks.push(spyOn(process.stdout, "write").mockImplementation((output) => {
		captureStack.at(-1)?.log.push([output.toString()]);
		return true;
	}));
	mocks.push(spyOn(process.stderr, "write").mockImplementation((output) => {
		captureStack.at(-1)?.log.push([output.toString()]);
		return true;
	}));

	// @ts-expect-error: ts(2345)
	mocks.push(spyOn(process.stdin, "isTTY").mockReturnValue(true));

	// @ts-expect-error: ts(2345)
	mocks.push(spyOn(process.stdout, "isTTY").mockReturnValue(true));
}

async function before() {
	await fs.mkdir(tempdir, { recursive: true });
	spy();
}
async function after() {
	await fs.rm(tempdir, { recursive: true });
	for (const x of mocks) x.mockRestore();
}



beforeAll(before);
afterAll(after);
