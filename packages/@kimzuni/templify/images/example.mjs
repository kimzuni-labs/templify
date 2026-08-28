import { render, compile } from "@kimzuni/templify";

// 1. Instant Rendering (Tree-shaking friendly)
console.log( render("Hello, {name}!", { name: "World" }) );
"Hello, World!";

// 2. Core Engine: Parsing & Metadata Extraction
const template = compile("[{level}] {message} (code: {id})");  // lazy evaluation
console.log( template.keys );                                  // parsed and cached
console.log( template.placeholders );                          // from cache
console.log( template.groups );                                // from cache
[ 'level', 'message', 'id' ];
[ '{level}', '{message}', '{id}' ];
({ level: [ '{level}' ], message: [ '{message}' ], id: [ '{id}' ] });

// 3. High Flexibility: Custom Rules & Fallback
const customTply = compile('echo "Running ${{ job }} (by ${{ user }})"', {
	open: "${{",
	close: "}}",
	fallback: "unknown",
});

// Fallback values in case of missing values in context
console.log( customTply.render({ job: "build-core" }) );
'echo "Running build-core (by unknown)"';
