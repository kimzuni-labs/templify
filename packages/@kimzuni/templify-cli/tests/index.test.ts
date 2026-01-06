import { describe, test, expect } from "bun:test";

import { main } from "../src";



describe("tmp desc", () => {
	test("tmp test", () => {
		expect(main()).toBe("hello, world!");
	});
});
