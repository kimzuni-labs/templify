import fs from "node:fs";
import { Bench } from "tinybench";
import { compile, render } from "@kimzuni/templify";
import Mustache from "mustache";



const template = "Hello {{ name }}, welcome to {{ project }}! Current year is {{ year }}.";
const context = { name: "John Doe", project: "templify", year: 2026 };

// precompile
const precompiled = compile(template);
Mustache.parse(template);

const bench = new Bench({ time: 1000 })
	.add("Native Template Literals", () => {
		return `Hello ${context.name}, welcome to ${context.project}! Current year is ${context.year}.`;
	})
	.add("mustache.js (Render)", () => {
		Mustache.render(template, context);
	})
	.add("templify (Precompiled Render Only)", () => {
		precompiled.render(context);
	})
	.add("templify (Direct render() Function)", () => {
		render(template, context);
	});

await bench.run();



function convertToMarkdownTable(data: ReturnType<typeof bench.table>) {
	if (data.length === 0 || !data[0]) return "";

	const keys = Object.keys(data[0]);

	let markdown = "### 📊 templify Performance Benchmark\n\n";
	markdown += `| ${keys.join(" | ")} |\n`;
	markdown += `| ${keys.map(() => "---").join(" | ")} |\n`;

	for (const row of data) {
		markdown += `| ${keys.map(k => row?.[k] ?? "").join(" | ")} |\n`;
	}
	return markdown;
}

const tableData = bench.table();
const markdownTable = convertToMarkdownTable(tableData);
if (process.env.GITHUB_ACTIONS) {
	console.log(markdownTable);
} else {
	// eslint-disable-next-line no-console
	console.table(tableData);
}

if (process.env.GITHUB_STEP_SUMMARY) {
	fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdownTable);
}
