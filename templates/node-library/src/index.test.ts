import { test } from "node:test";
import assert from "node:assert";
import { hello, Example } from "./index.js";

test("hello function", () => {
   assert.strictEqual(hello("World"), "Hello, World!");
});

test("Example class", () => {
   const example = new Example("Test");
   assert.strictEqual(example.greet(), "Hello, Test!");
});