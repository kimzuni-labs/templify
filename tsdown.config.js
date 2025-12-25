import { defineConfig } from "tsdown";



/** @type {import("tsdown").UserConfig} */

const options = {
	clean   : false,
	entry   : "./src/index.ts",
	outDir  : "./dist",
	platform: "neutral",
	target  : "es6",
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
