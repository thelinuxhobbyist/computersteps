import test from "node:test";
import assert from "node:assert/strict";

import { endSentence, isAnswerCorrect, isFileSafeForUpload } from "./lesson-utils";

test("endSentence adds a full stop when text has none", () => {
  assert.equal(endSentence("Please find my file attached"), "Please find my file attached.");
  assert.equal(endSentence("Click Save"), "Click Save.");
});

test("endSentence does not duplicate sentence-ending punctuation", () => {
  assert.equal(endSentence("Please find my file attached."), "Please find my file attached.");
  assert.equal(endSentence("Can I borrow a book?"), "Can I borrow a book?");
  assert.equal(endSentence("Thanks!"), "Thanks!");
  assert.equal(endSentence("."), ".");
  assert.equal(endSentence("?"), "?");
});

test("accepts a real name in a name field", () => {
  assert.equal(isAnswerCorrect("James Alan", "your-name", "your-name"), true);
});

test("accepts different student names", () => {
  assert.equal(isAnswerCorrect("Sofia Rahman", "your-name", "your-name"), true);
  assert.equal(isAnswerCorrect("Aisha", "your-name", "your-name"), true);
});

test("rejects nonsense name input", () => {
  assert.equal(isAnswerCorrect("dafdsfs", "your-name", "your-name"), false);
});

test("accepts the exact word for a typed answer", () => {
  assert.equal(isAnswerCorrect("computer", "computer"), true);
});

test("rejects non-matching typed answers", () => {
  assert.equal(isAnswerCorrect("library", "computer"), false);
});

test("accepts punctuation answers exactly", () => {
  assert.equal(isAnswerCorrect(",", ","), true);
  assert.equal(isAnswerCorrect(".", "."), true);
  assert.equal(isAnswerCorrect("@", "@"), true);
  assert.equal(isAnswerCorrect("'", "@"), false);
  assert.equal(isAnswerCorrect(",.", ","), false);
});

test("requires exact case when the expected answer includes capitals", () => {
  assert.equal(isAnswerCorrect("Water", "Water"), true);
  assert.equal(isAnswerCorrect("water", "Water"), false);
  assert.equal(isAnswerCorrect("My name is David.", "My name is David."), true);
});

test("accepts any ordinary file under the size limit", () => {
  assert.equal(isFileSafeForUpload({ name: "photo.jpg", size: 2 * 1024 * 1024 }), true);
  assert.equal(isFileSafeForUpload({ name: "my-document.pdf", size: 8 * 1024 * 1024 }), true);
});

test("rejects oversized files", () => {
  assert.equal(isFileSafeForUpload({ name: "big-file.zip", size: 11 * 1024 * 1024 }), false);
});
