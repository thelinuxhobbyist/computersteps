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

test("includes the practice websites", () => {
  assert.equal(getScenario("practice-shop")?.href, "/shop/");
  assert.equal(getScenario("practice-bank")?.href, "/scenarios/practice-bank/");
  assert.equal(getScenario("gp-surgery")?.href, "/scenarios/gp-surgery/");
  assert.equal(getScenario("westford-energy")?.href, "/scenarios/energy/");
  assert.equal(getScenario("westford-council")?.href, "/scenarios/council/");
  assert.equal(getScenario("westford-mobile")?.href, "/scenarios/mobile/");
  assert.equal(getScenario("westford-deliveries")?.href, "/scenarios/deliveries/");
  assert.equal(getScenario("westford-travel")?.href, "/scenarios/travel/");
});
