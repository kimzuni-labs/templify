import { defineConfig } from "tsdown";

import tsconfig from "./tsconfig.json" with { type: "json" };



/** @type {import("tsdown").UserConfig} */

const options = {
	clean   : false,
	entry   : "./src/index.ts",
	outDir  : "./dist",
	platform: "neutral",
	target  : tsconfig.compilerOptions.target,
	unbundle: true,
};

export default defineConfig([
	{
		...options,
		format: ["cjs"],
		dts   : false,
	},
	{
		...options,
		format: ["esm"],
		dts   : true,
	},
]);
