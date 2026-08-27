import { KEY_PATTERNS, compile, render } from "@kimzuni/templify";

const template = "{ key1 }, { key2 }!";
const options = { open: "{", close: "}", key: KEY_PATTERNS.DEFAULT };
const data = { key1: "Hello", key2: "World" };

const c = compile(template, options);         // lazy evaluation
console.log("keys        :", c.keys);         // parsed and cached
console.log("placeholders:", c.placeholders); // from cache
console.log("groups      :", c.groups);       // from cache

console.log("render      :", c.render(data));
console.log("direct      :", render(template, data, options));
