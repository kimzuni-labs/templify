import fs from "node:fs/promises";

import { render } from "@kimzuni/templify";



export function main() {
	return render(
		"{0}, {1}!",
		["hello", "world"],
		{},
	);
}



const execfile = await fs.realpath(process.argv.at(1) ?? "").catch(() => "");
const filepath = await fs.realpath(import.meta.filename).catch(() => "");
if (execfile && execfile === filepath) {
	console.info(main());
}
