import { $ } from "bun";
import fs from "node:fs/promises";



await $`rm -rf dist`;

const build = async (type: "cjs" | "esm" | "dts") => {
	if (type !== "dts") {
		const results = await Bun.build({
			tsconfig   : "tsconfig.json",
			entrypoints: ["src/index.ts"],
			outdir     : `dist/${type}`,
			format     : type,
		});
		if (type === "esm") {
			for (const output of results.outputs) {
				if (output.path.endsWith(".js")) {
					const newPath = `${output.path.slice(0, -2)}mjs`;
					await fs.rename(output.path, newPath);
				}
			}
		}
	} else {
		await $`bun tsc -p tsconfig.dts.json`;
	}
};

await Promise.all([
	build("cjs"),
	build("esm"),
	build("dts"),
]);
