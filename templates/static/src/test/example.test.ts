import { test } from "node:test";
import assert from "node:assert";

test("example test", () => {
	assert.strictEqual(1 + 1, 2);
});

test("async test example", async () => {
	const promise = Promise.resolve("hello");
	const result = await promise;
	assert.strictEqual(result, "hello");
});