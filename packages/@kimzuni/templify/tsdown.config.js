import { defineConfig } from "tsdown";



/** @type {import("tsdown").UserConfig} */

const options = {
	entry: "./src/index.ts",
};

export default defineConfig([
	{
		...options,
		format  : ["cjs", "esm"],
		platform: "neutral",
		outDir  : "./dist",
		dts     : true,
		clean   : true,
		unbundle: true,
		target  : "node22",
	},
	{
		...options,
		format    : ["iife"],
		platform  : "browser",
		globalName: "Templify",
		outDir    : "./dist/browser",
		dts       : false,
		minify    : true,
		clean     : false,
		target    : "es2020",
	},
]);
