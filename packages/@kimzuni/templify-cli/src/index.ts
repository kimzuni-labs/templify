#!/usr/bin/env node

import fs from "node:fs";

import { run } from "./cli";



const execfile = fs.realpathSync(process.argv.at(1) ?? "");
const filepath = fs.realpathSync(import.meta.filename);
if (execfile && execfile === filepath) {
	run().catch((e: unknown) => {
		console.error(e);
	});
}
