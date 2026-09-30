import test from "node:test";
import assert from "node:assert/strict";

import { SCENARIOS, getScenario } from "./scenarios";

test("scenario ids are unique", () => {
  const ids = SCENARIOS.map((scenario) => scenario.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("scenario links are internal and end with a slash for the static export", () => {
  for (const scenario of SCENARIOS) {
    assert.match(scenario.href, /^\/.*\/$/, `${scenario.id} has an invalid href`);
  }
});

test("every scenario has tasks a tutor can set", () => {
  for (const scenario of SCENARIOS) {
    assert.ok(scenario.tutorTasks.length > 0, `${scenario.id} has no tutor tasks`);
  }
});

test("includes the Practice Shop and GP Surgery", () => {
  assert.equal(getScenario("practice-shop")?.href, "/shop/");
  assert.equal(getScenario("gp-surgery")?.href, "/scenarios/gp-surgery/");
});
