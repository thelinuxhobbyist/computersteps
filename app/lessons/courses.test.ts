import test from "node:test";
import assert from "node:assert/strict";

import {
  courseGroups,
  getFirstLessonInCourse,
  getNextCourse,
  getNextLessonInCourse,
  isLastLessonInCourse,
} from "./courses";

test("finds the next lesson inside a course", () => {
  const next = getNextLessonInCourse("computer");
  assert.equal(next?.id, "mouse");
});

test("returns null for the last lesson in a course", () => {
  assert.equal(getNextLessonInCourse("put-in-place"), null);
});

test("detects when a lesson is the last in its course", () => {
  assert.equal(isLastLessonInCourse("put-in-place"), true);
  assert.equal(isLastLessonInCourse("computer"), false);
});

test("suggests the next course in order", () => {
  const next = getNextCourse("computer-basics");
  assert.equal(next?.id, "keyboard-skills");
});

test("returns the first lesson for a course", () => {
  const first = getFirstLessonInCourse("keyboard-skills");
  assert.equal(first?.id, "keyboard");
});

test("returns null after the final course", () => {
  const lastCourse = courseGroups[courseGroups.length - 1];
  assert.equal(getNextCourse(lastCourse.id), null);
});
