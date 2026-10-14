import test from "node:test";
import assert from "node:assert/strict";
import { readIdempotencyKey } from "./payments";

test("idempotency keys are optional UUIDs", () => {
  assert.equal(readIdempotencyKey(undefined), null);
  assert.equal(readIdempotencyKey(""), null);
  assert.equal(readIdempotencyKey("short"), "invalid");
  assert.equal(readIdempotencyKey("abc12345-def"), "abc12345-def");
  assert.equal(readIdempotencyKey("has space!!"), "invalid");
});
