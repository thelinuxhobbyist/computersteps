import test from "node:test";
import assert from "node:assert/strict";

import { validateDraft, practiceStatus, interviewDate, type ApplicationDraft, EMPTY_DRAFT } from "./shared/job-application";
import { VACANCIES } from "./shared/job-catalogue";
import { VACANCY_EXPANSION } from "./shared/vacancy-expansion";
import { validateVacancyList } from "./shared/validate-vacancies";
import {
  EXAMPLE_SEARCHES,
  LOCATION_GROUPS,
  PAGE_SIZE,
  emptyJobQuery,
  explainEmptySearch,
  formatLocation,
  parseJobQuery,
  refineJobQuery,
  searchJobs,
} from "./shared/jobs";
import { JOB_EXERCISES } from "./shared/job-exercises";
import { checkJobExercise, type ExerciseSnapshot } from "./job-exercise-checks";

const blank = (): ApplicationDraft => ({ ...EMPTY_DRAFT });

function allMatches(query: ReturnType<typeof emptyJobQuery>) {
  const first = searchJobs(VACANCIES, { ...query, page: 1 });
  const pages = Math.max(1, Math.ceil(first.total / PAGE_SIZE));
  const jobs = [];
  for (let page = 1; page <= pages; page += 1) {
    jobs.push(...searchJobs(VACANCIES, { ...query, page }).results);
  }
  return jobs;
}

test("the catalogue has a varied set of fictional vacancies", () => {
  assert.ok(VACANCIES.length >= 200);
  assert.ok(VACANCIES.length <= 400);
  assert.equal(new Set(VACANCIES.map((job) => job.id)).size, VACANCIES.length);
  assert.equal(new Set(VACANCIES.map((job) => job.reference)).size, VACANCIES.length);
  assert.ok(VACANCIES.some((job) => job.suspicious));
  assert.ok(VACANCIES.some((job) => job.experience === "entry"));
  assert.ok(VACANCIES.some((job) => job.experience === "experienced"));
  for (const phrase of EXAMPLE_SEARCHES) {
    const found = searchJobs(VACANCIES, { ...emptyJobQuery(), q: phrase });
    assert.ok(found.total > 0, phrase);
  }
});

test("search ignores case and extra spaces and combines filters", () => {
  const noisy = searchJobs(VACANCIES, { ...emptyJobQuery(), q: "  WAREHOUSE   operative " });
  assert.ok(noisy.results.some((job) => job.id === "wfj-1001"));
  assert.ok(noisy.total >= 3);
  const ealing = searchJobs(VACANCIES, { ...emptyJobQuery(), where: "  ealing " });
  assert.ok(ealing.total >= 3);
  assert.ok(ealing.results.every((job) => formatLocation(job).includes("Ealing") || job.postcode.startsWith("W5")));
  const retail = searchJobs(VACANCIES, { ...emptyJobQuery(), q: "retail assistant", where: "Leeds", hours: "part-time" });
  assert.equal(retail.total, 1);
  assert.equal(retail.results[0].id, "wfj-1011");
  const postcode = searchJobs(VACANCIES, { ...emptyJobQuery(), where: "w52np" });
  assert.ok(postcode.results.some((job) => job.id === "wfj-1001"));
  const address = searchJobs(VACANCIES, { ...emptyJobQuery(), where: "1 The Mall, Ealing, W5 2NP" });
  assert.ok(address.results.some((job) => job.id === "wfj-1001"));
  const editing = searchJobs(VACANCIES, { ...emptyJobQuery(), q: "editing", where: "London" });
  assert.ok(editing.total >= 2);
  assert.ok(editing.results.every((job) => job.city === "London"));
  const editor = searchJobs(VACANCIES, { ...emptyJobQuery(), q: "editor", where: "London" });
  assert.ok(editor.results.some((job) => job.id === "wfj-1133"));
  assert.ok(editor.results.some((job) => job.id === "wfj-1134"));
  const proofreader = searchJobs(VACANCIES, { ...emptyJobQuery(), q: "proofreader", where: "London" });
  assert.ok(proofreader.results.some((job) => job.id === "wfj-1133"));
});

test("salary, contract and sort options change the list", () => {
  const high = allMatches({ ...emptyJobQuery(), salary: "32000-plus" });
  assert.ok(high.some((job) => job.id === "wfj-1081"));
  assert.ok(high.every((job) => job.payAnnualMax >= 32000));
  const temporary = searchJobs(VACANCIES, { ...emptyJobQuery(), contract: "temporary" });
  assert.ok(temporary.results.every((job) => job.contract === "temporary"));
  assert.ok(temporary.total > PAGE_SIZE || temporary.results.some((job) => job.id === "wfj-1024"));
  const bySalary = searchJobs(VACANCIES, { ...emptyJobQuery(), sort: "salary" });
  assert.ok(bySalary.results[0].payAnnualMax >= bySalary.results[1].payAnnualMax);
  const page2 = searchJobs(VACANCIES, { ...emptyJobQuery(), sort: "newest", page: 2 });
  assert.equal(page2.results.length, PAGE_SIZE);
  assert.notEqual(page2.results[0].id, searchJobs(VACANCIES, { ...emptyJobQuery(), sort: "newest" }).results[0].id);
});

test("an empty search explains itself by returning the whole catalogue in pages", () => {
  const all = searchJobs(VACANCIES, emptyJobQuery());
  assert.equal(all.total, VACANCIES.length);
  assert.equal(all.results.length, PAGE_SIZE);
  const none = searchJobs(VACANCIES, { ...emptyJobQuery(), q: "underwater welder" });
  assert.equal(none.total, 0);
  assert.deepEqual(none.results, []);
});

test("an editing search in Ealing stays empty until the place or category is widened", () => {
  const query = { ...emptyJobQuery(), q: "editing", where: "Ealing", category: "education" };
  assert.equal(searchJobs(VACANCIES, query).total, 0);
  assert.equal(parseJobQuery(new URLSearchParams("q=editing&where=Ealing")).category, "");
  const explained = explainEmptySearch(VACANCIES, query);
  assert.match(explained.detail, /Education is only applied/);
  assert.ok(explained.alternatives.some((item) => item.query.where === "London" && item.query.category === "education"));
  assert.ok(explained.related?.jobs.some((job) => job.id === "wfj-1134"));
});

test("a typed sentence can set the place, the hours and the experience", () => {
  const officeQuery = refineJobQuery(VACANCIES, { ...emptyJobQuery(), q: "Office administrator in Ealing" });
  assert.equal(officeQuery.q, "Office administrator");
  assert.equal(officeQuery.where, "Ealing");
  const receptionQuery = refineJobQuery(VACANCIES, { ...emptyJobQuery(), q: "Part-time reception work in Acton" });
  assert.equal(receptionQuery.q, "reception work");
  assert.equal(receptionQuery.where, "Acton");
  assert.equal(receptionQuery.hours, "part-time");
  const beginnersQuery = refineJobQuery(VACANCIES, { ...emptyJobQuery(), q: "Jobs with no previous experience" });
  assert.equal(beginnersQuery.q, "");
  assert.equal(beginnersQuery.experience, "entry");
  const office = searchJobs(VACANCIES, { ...emptyJobQuery(), q: "Office administrator in Ealing" });
  assert.ok(office.results.some((job) => job.id === "wfj-2001"));
  const reception = searchJobs(VACANCIES, { ...emptyJobQuery(), q: "Part-time reception work in Acton" });
  assert.ok(reception.results.some((job) => job.id === "wfj-2004"));
  assert.ok(reception.results.every((job) => job.hours === "part-time"));
  const warehouse = searchJobs(VACANCIES, { ...emptyJobQuery(), q: "Warehouse operative in Greenford" });
  assert.ok(warehouse.results.some((job) => job.id === "wfj-2005"));
  const service = searchJobs(VACANCIES, { ...emptyJobQuery(), q: "Customer service jobs in Southall" });
  assert.ok(service.results.some((job) => job.id === "wfj-2006"));
  const beginners = searchJobs(VACANCIES, { ...emptyJobQuery(), q: "Jobs with no previous experience" });
  assert.ok(beginners.total > 0);
  assert.ok(beginners.results.every((job) => job.experience === "entry"));
  const west = searchJobs(VACANCIES, { ...emptyJobQuery(), q: "Entry-level jobs in West London" });
  assert.ok(west.total >= 8);
  assert.ok(west.results.every((job) => job.experience === "entry"));
  const sponsored = allMatches({ ...emptyJobQuery(), sponsorship: "available" });
  assert.ok(sponsored.some((job) => job.id === "wfj-2008"));
  assert.ok(sponsored.every((job) => job.sponsorship === "available"));
  for (const place of LOCATION_GROUPS[0].places) {
    assert.ok(searchJobs(VACANCIES, { ...emptyJobQuery(), where: place }).total > 0, place);
  }
});

test("the expansion seed has distinct, consistent vacancies", () => {
  assert.equal(validateVacancyList(VACANCY_EXPANSION).join("\n"), "");
  assert.ok(VACANCY_EXPANSION.length >= 150);
});

test("query strings keep only the filters a learner set", () => {
  const query = parseJobQuery(new URLSearchParams("q=Cleaner&where=Ealing&hours=part-time&page=2&sort=newest&category=nope"));
  assert.equal(query.q, "Cleaner");
  assert.equal(query.where, "Ealing");
  assert.equal(query.hours, "part-time");
  assert.equal(query.page, 2);
  assert.equal(query.category, "");
});

test("practice applications reject missing details and do not need a National Insurance number", () => {
  const draft = blank();
  const errors = validateDraft(draft, "all");
  assert.ok(errors.firstName);
  assert.ok(errors.email);
  assert.equal(errors.nationalInsurance, undefined);
  draft.firstName = "Sam";
  draft.surname = "Patel";
  draft.email = "sam.learner@example.com";
  draft.telephone = "07700 900184";
  draft.town = "Westford";
  draft.noExperience = true;
  draft.skills = "None yet";
  draft.previousExperience = "None yet";
  draft.qualifications = "None yet";
  draft.statement = "I am practising this form and I can work carefully in a kitchen.";
  assert.deepEqual(validateDraft(draft, "all"), {});
  assert.equal(practiceStatus("wfj-1040", false), "interview");
  assert.equal(practiceStatus("wfj-1901", true), "submitted");
  assert.equal(interviewDate("2026-10-15T12:00:00.000Z"), "2026-10-26");
});

test("every guided task can be checked, and a wrong answer explains where to look", () => {
  assert.ok(JOB_EXERCISES.length >= 20);
  assert.equal(new Set(JOB_EXERCISES.map((exercise) => exercise.id)).size, JOB_EXERCISES.length);
  const signedOut = checkJobExercise("save-job", "", [], null);
  assert.equal(signedOut.needsSignIn, true);
  const wrong = checkJobExercise("find-search", "Apply now", [], null);
  assert.equal(wrong.correct, false);
  assert.match(wrong.feedback, /Find jobs/);
  const right = checkJobExercise("find-search", "Search jobs", [], null);
  assert.equal(right.correct, true);
  const salary = checkJobExercise("find-salary", "£12.21 an hour", [], null);
  assert.equal(salary.correct, true);
  const date = checkJobExercise("closing-date", "06/11/2026", [], null);
  assert.equal(date.correct, true);
  assert.equal(checkJobExercise("office-ealing", "Larch Ledger", [], null).correct, true);
  assert.equal(checkJobExercise("read-sponsorship", "", ["deskworks"], null).correct, true);
  assert.equal(checkJobExercise("suitability-priya", "", ["larch"], null).correct, true);
  assert.equal(checkJobExercise("sponsorship-amira", "", ["both"], null).correct, false);
  assert.equal(checkJobExercise("acton-closing", "18/11/2026", [], null).correct, true);
  const signs = checkJobExercise("spot-warning-signs", "", ["fee", "pay", "pressure"], null);
  assert.equal(signs.correct, true);
  const tooBroad = checkJobExercise("spot-warning-signs", "", ["fee", "pay", "pressure", "address"], null);
  assert.equal(tooBroad.correct, false);
});

test("saved jobs and applications are checked against the signed-in learner only", () => {
  const snapshot: ExerciseSnapshot = {
    savedJobIds: ["wfj-1070", "wfj-1062"],
    applications: [
      {
        jobId: "wfj-1050",
        reference: "WJ-2026-10001",
        telephone: "07700 900184",
        town: "Westford",
        status: "submitted",
        submittedAt: "2026-10-15T12:00:00.000Z",
      },
      {
        jobId: "wfj-1060",
        reference: "WJ-2026-10002",
        telephone: "07700 900111",
        town: "Brighton",
        status: "submitted",
        submittedAt: "2026-10-15T11:00:00.000Z",
      },
      {
        jobId: "wfj-1040",
        reference: "WJ-2026-10003",
        telephone: "07700 900184",
        town: "Leeds",
        status: "interview",
        submittedAt: "2026-10-15T10:00:00.000Z",
      },
    ],
  };
  assert.equal(checkJobExercise("save-job", "", [], snapshot).correct, true);
  assert.equal(checkJobExercise("multi-step", "", [], snapshot).correct, true);
  assert.equal(checkJobExercise("find-saved", "Leeds", [], snapshot).correct, true);
  assert.equal(checkJobExercise("complete-application", "", [], snapshot).correct, true);
  assert.equal(checkJobExercise("review-application", "", [], snapshot).correct, true);
  assert.equal(checkJobExercise("find-application", "WJ-2026-10002", [], snapshot).correct, true);
  assert.equal(checkJobExercise("find-application", "WFJ-1001", [], snapshot).correct, false);
  assert.equal(checkJobExercise("interview-invitation", "10:30", [], snapshot).correct, true);
  const other: ExerciseSnapshot = { savedJobIds: ["wfj-1001"], applications: [] };
  assert.equal(checkJobExercise("save-job", "", [], other).correct, false);
});
