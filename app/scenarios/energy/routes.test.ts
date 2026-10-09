import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { EXERCISES } from "../../../workers/practice-bank/src/exercises/library";
import { SITES, pageIdFor } from "../../../workers/practice-bank/src/shared/sites";

const appDir = path.resolve(__dirname, "../..");
const helpSlugs = [...readFileSync(path.join(__dirname, "help/help-articles.tsx"), "utf8").matchAll(/slug: "([a-z-]+)"/g)].map((match) => match[1]);

/** "energy.help.scams" becomes the folder that would hold that page. */
function routeExists(pageId: string): boolean {
  const [siteId, ...parts] = pageId.split(".");
  const site = SITES.find((item) => item.id === siteId);
  if (!site) return false;
  const rest = parts[0] === "home" ? [] : parts;
  if (siteId === "energy" && rest[0] === "help" && rest.length === 2) return helpSlugs.includes(rest[1]);
  const folder = path.join(appDir, site.bases[0], ...rest);
  return existsSync(path.join(folder, "page.tsx"));
}

test("every page a navigation exercise asks for exists on the website", () => {
  for (const exercise of EXERCISES) {
    if (exercise.answer.type !== "navigation") continue;
    for (const page of exercise.answer.pages) {
      const exact = page.endsWith(".*") ? page.slice(0, -2) : page;
      assert.ok(routeExists(exact), `${exercise.id} sends learners to ${page}, which has no page`);
    }
  }
});

test("help article addresses turn into the page ids exercises use", () => {
  assert.equal(pageIdFor("/scenarios/energy/help/ways-to-pay/"), "energy.help.ways-to-pay");
  assert.ok(helpSlugs.includes("ways-to-pay"));
  assert.ok(helpSlugs.length >= 10);
});
