// Validates a JSON seed of fictional vacancies and writes the TypeScript module the site imports.
// Usage, from the repository root:
//   node --experimental-strip-types workers/practice-bank/scripts/import-vacancies.ts workers/practice-bank/seeds/vacancy-expansion.json
import { readFileSync, writeFileSync } from "node:fs";
import { validateVacancyList } from "../src/shared/validate-vacancies.ts";
import type { VacancyInput } from "../src/shared/jobs.ts";

const source = process.argv[2];
const target = process.argv[3] ?? "workers/practice-bank/src/shared/vacancy-expansion.ts";
if (!source) {
  console.error("Give the path of a JSON file containing an array of vacancies.");
  process.exit(1);
}

const inputs = JSON.parse(readFileSync(source, "utf8")) as VacancyInput[];
if (!Array.isArray(inputs)) {
  console.error("The seed file must be a JSON array.");
  process.exit(1);
}
const errors = validateVacancyList(inputs);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const body = `import type { VacancyInput } from "./jobs";

// Generated from the JSON seed. Edit the seed, then run scripts/import-vacancies.ts.
export const VACANCY_EXPANSION: VacancyInput[] = ${JSON.stringify(inputs, null, 2)};
`;
writeFileSync(target, body);
console.log(`Wrote ${inputs.length} vacancies to ${target}`);
