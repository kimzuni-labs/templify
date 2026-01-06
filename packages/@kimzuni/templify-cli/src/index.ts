#!/usr/bin/env node

import fs from "node:fs/promises";

import { run } from "./cli";



const execfile = await fs.realpath(process.argv.at(1) ?? "").catch(() => "");
const filepath = await fs.realpath(import.meta.filename).catch(() => "");
if (execfile && execfile === filepath) {
	await run();
}
