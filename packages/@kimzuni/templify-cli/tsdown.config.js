import { defineConfig } from "tsdown";

import tsconfig from "./tsconfig.json" with { type: "json" };



export default defineConfig([
	{
		clean: true,
		entry: [
			"./src/index.ts",
		],
		unbundle: true,
		outDir  : "./dist",
		platform: "node",
		target  : tsconfig.compilerOptions.target,
		hash    : false,
		dts     : false,
	},
]);
