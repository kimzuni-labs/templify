import { defineConfig, type Options } from "tsdown";



const options: Options = {
	clean   : false,
	entry   : "./src/index.ts",
	outDir  : "./dist",
	platform: "neutral",
	target  : "es6",
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
