import test from "node:test";
import assert from "node:assert/strict";

import type { BankAccountView } from "../accounts";
import { bankTransactionFor, billStatuses, buildEnergyHistory } from "../energy";
import type { EnergyAccount } from "../shared/energy-types";
import { CATEGORY_LABELS, DIFFICULTIES, SKILL_LABELS } from "../shared/exercise-types";
import { SITES, pageIdFor, pageMatches } from "../shared/sites";
import { WESTFORD } from "../shared/westford";
import { checkAnswer, correctOptions, parseDate, parseNumber } from "./answers";
import { buildFacts, type LearnerWorld } from "./facts";
import { EXERCISES } from "./library";
import { chooseNext, isAvailable, learnerLevel, rankExercises, requiredFacts, type HistoryItem } from "./select";
import type { Exercise, Facts } from "./types";
import { allHold, formatDay, render, resolve } from "./values";

const seeded = (seed = 7) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
};

const TODAY = "2026-10-07";
const NOW = new Date(`${TODAY}T12:00:00Z`);

/** A learner who has opened the bank, shopped once and visited Westford Energy. */
function sampleWorld(options: { paid?: boolean; directDebit?: boolean } = {}): LearnerWorld {
  const history = buildEnergyHistory(TODAY, seeded());
  const payments = history.payments.map((payment, index) => ({ ...payment, id: index + 1 }));
  if (options.paid) payments.push({ id: 99, paidAt: `${TODAY}T11:00:00.000Z`, amountPence: 8450, method: "card_online", reference: "WP9999999" });

  const bills = billStatuses(
    history.bills.map((bill, index) => ({
      ...bill,
      id: index + 1,
      energyChargePence: bill.kwh * bill.unitRatePence,
      standingTotalPence: bill.days * bill.standingChargePence,
    })),
    payments,
    TODAY,
  ).reverse();

  const energy: EnergyAccount = {
    username: "random123",
    fullName: "Emily James",
    addressLine1: "14 Willow Close",
    townOrCity: "Townsville",
    postcode: "PB3 7AB",
    accountNumber: history.accountNumber,
    meterSerial: history.meterSerial,
    tariffName: WESTFORD.tariff.name,
    unitRatePence: 25,
    standingChargePence: 50,
    directDebit: options.directDebit ? { accountName: "Emily James", sortCode: "00-12-34", accountNumberEnding: "5678", day: 1, setUpAt: "2026-09-01T00:00:00Z" } : null,
    balancePence: bills.reduce((sum, bill) => sum + bill.amountPence, 0) - payments.reduce((sum, payment) => sum + payment.amountPence, 0),
    bills,
    payments: [...payments].sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
    readings: history.readings.map((reading, index) => ({ ...reading, id: index + 1 })).reverse(),
    messages: [],
    createdAt: NOW.toISOString(),
    today: TODAY,
  };

  const transactions = [
    { postedAt: "2026-09-01T06:00:00Z", description: "Pension payment", type: "Payment in", category: "Money in", amountPence: 72000, reference: null },
    { postedAt: "2026-09-01T07:00:00Z", description: "Oakfield Housing (rent)", type: "Direct Debit", category: "Bills", amountPence: -26000, reference: null },
    { postedAt: "2026-10-05T14:00:00Z", description: "Practice Shop", type: "Card payment", category: "Shopping", amountPence: -1234, reference: "PS-123456" },
    ...history.payments.map(bankTransactionFor),
  ].map((transaction, index) => ({ ...transaction, id: index + 1 }));

  const bank: BankAccountView = {
    username: "random123",
    fullName: "Emily James",
    addressLine1: "14 Willow Close",
    townOrCity: "Townsville",
    postcode: "PB3 7AB",
    nameOnCard: "EMILY JAMES",
    cardNumber: "4000123412341234",
    expiry: "10/30",
    cvv: "123",
    sortCode: "00-12-34",
    accountNumber: "12345678",
    openingBalancePence: 50000,
    balancePence: 50000,
    createdAt: "2026-06-01T00:00:00Z",
    transactions,
  };

  return { bank, energy, now: NOW };
}

/** What a learner who got it right would type or choose. */
function correctAnswer(exercise: Exercise, facts: Facts): string | string[] | null {
  const { answer } = exercise;
  switch (answer.type) {
    case "number": {
      const value = resolve(answer.value, facts) as number;
      return answer.unit === "money" ? `£${(value / 100).toFixed(2)}` : String(value);
    }
    case "text":
      return String(resolve(answer.accept[0], facts));
    case "date":
      return formatDay(String(resolve(answer.value, facts)));
    case "choice":
      return correctOptions(answer, facts);
    case "yes_no": {
      const expected =
        typeof answer.correct === "boolean" ? answer.correct : "when" in answer.correct ? allHold(answer.correct.when, facts) : resolve(answer.correct, facts) === true;
      return expected ? "yes" : "no";
    }
    default:
      return null;
  }
}

test("the library is large and varied", () => {
  assert.ok(EXERCISES.length >= 80, `only ${EXERCISES.length} exercises`);
  for (const category of Object.keys(CATEGORY_LABELS)) {
    const count = EXERCISES.filter((exercise) => exercise.category === category).length;
    assert.ok(count >= 10, `${category} has only ${count} exercises`);
  }
  for (const difficulty of DIFFICULTIES) {
    assert.ok(EXERCISES.filter((exercise) => exercise.difficulty === difficulty).length >= 10, `${difficulty} has fewer than 10`);
  }
  for (const type of ["number", "text", "date", "choice", "yes_no", "action", "navigation"]) {
    assert.ok(EXERCISES.some((exercise) => exercise.answer.type === type), `no ${type} exercises`);
  }
});

test("exercise ids are unique and metadata is valid", () => {
  const ids = EXERCISES.map((exercise) => exercise.id);
  assert.equal(new Set(ids).size, ids.length);
  const siteIds = SITES.map((site) => site.id as string);
  for (const exercise of EXERCISES) {
    assert.ok(exercise.requiredSites.includes(exercise.site), `${exercise.id} must list its own site`);
    assert.ok(exercise.requiredSites.every((site) => siteIds.includes(site)), `${exercise.id} has an unknown site`);
    assert.ok(exercise.skills.length > 0 && exercise.skills.every((skill) => skill in SKILL_LABELS), `${exercise.id} skills`);
    assert.ok(exercise.hint && exercise.feedback, `${exercise.id} needs a hint and feedback`);
    if (exercise.requiredSites.length > 1) assert.ok(exercise.skills.includes("cross_site_navigation") || exercise.category === "payments", exercise.id);
  }
  assert.ok(EXERCISES.filter((exercise) => exercise.requiredSites.length > 1).length >= 15);
});

test("instructions never tell the learner which button to press", () => {
  for (const exercise of EXERCISES) {
    assert.doesNotMatch(exercise.instruction, /\bclick\b(?! here)|\bbutton\b|\bmenu\b|\btab\b/i, exercise.id);
  }
});

test("every exercise renders and its right answer is accepted", () => {
  const worlds = [sampleWorld(), sampleWorld({ paid: true }), sampleWorld({ directDebit: true })];
  const covered = new Set<string>();

  for (const world of worlds) {
    const facts = buildFacts(world, NOW.toISOString());
    for (const exercise of EXERCISES.filter((item) => isAvailable(item, facts))) {
      covered.add(exercise.id);
      for (const name of requiredFacts(exercise)) assert.ok(name in facts, `${exercise.id} needs ${name}`);
      render(exercise.instruction, facts);
      render(exercise.hint, facts);
      render(exercise.feedback, facts);
      if (exercise.answer.type === "choice") exercise.answer.options.forEach((option) => render(option.label, facts));

      const answer = correctAnswer(exercise, facts);
      if (answer === null) continue;
      const result = checkAnswer(exercise.answer, answer, facts);
      assert.ok(result.correct, `${exercise.id}: "${String(answer)}" was not accepted (${result.feedback ?? ""})`);
    }
  }

  const neverAvailable = EXERCISES.filter((exercise) => !covered.has(exercise.id)).map((exercise) => exercise.id);
  // Only the part-payment follow-up needs a state the sample worlds don't have.
  assert.deepEqual(neverAvailable, ["energy.pay.left-to-pay"]);
});

test("choice exercises always have exactly the right options", () => {
  const facts = buildFacts(sampleWorld(), NOW.toISOString());
  for (const exercise of EXERCISES) {
    if (exercise.answer.type !== "choice" || !isAvailable(exercise, facts)) continue;
    const ids = exercise.answer.options.map((option) => option.id);
    assert.equal(new Set(ids).size, ids.length, exercise.id);
    for (const id of correctOptions(exercise.answer, facts)) assert.ok(ids.includes(id), `${exercise.id}: ${id} is not an option`);
    if (!exercise.answer.multiple) assert.equal(correctOptions(exercise.answer, facts).length, 1, exercise.id);
  }
});

test("payment exercises follow the state of the account", () => {
  const unpaid = buildFacts(sampleWorld(), NOW.toISOString());
  const paid = buildFacts(sampleWorld({ paid: true }), "2026-10-07T10:00:00.000Z");
  const pay = EXERCISES.find((exercise) => exercise.id === "energy.pay.pay-online")!;
  assert.equal(isAvailable(pay, unpaid), true);
  assert.equal(isAvailable(pay, paid), false);
  assert.equal(pay.answer.type === "action" && allHold(pay.answer.success, paid), true);
  assert.equal(unpaid["energy.bill.amount"].kind === "money" && unpaid["energy.bill.amount"].pence, 8450);
  assert.equal(unpaid["energy.prevBill.amount"].kind === "money" && unpaid["energy.prevBill.amount"].pence, 6200);
  assert.equal(unpaid["energy.billDifference"].kind === "money" && unpaid["energy.billDifference"].pence, 2250);
});

test("wrong answers get specific feedback for common mistakes", () => {
  const facts = buildFacts(sampleWorld(), NOW.toISOString());
  const exercise = EXERCISES.find((item) => item.id === "energy.find.latest-bill-amount")!;
  const result = checkAnswer(exercise.answer, "£62", facts);
  assert.equal(result.correct, false);
  assert.match(result.feedback ?? "", /older bill/);
});

test("numbers and dates are read the way people type them", () => {
  assert.equal(parseNumber("£84.50", "money"), 8450);
  assert.equal(parseNumber("84.5", "money"), 8450);
  assert.equal(parseNumber("£1,084", "money"), 108400);
  assert.equal(parseNumber("25p", "pence"), 25);
  assert.equal(parseNumber("£0.25", "pence"), 25);
  assert.equal(parseNumber("278 kWh", "kWh"), 278);
  assert.equal(parseNumber("none", "money"), null);

  assert.deepEqual(parseDate("15 October"), { day: 15, month: 10, year: undefined });
  assert.deepEqual(parseDate("Thursday 15th Oct 2026"), { day: 15, month: 10, year: 2026 });
  assert.deepEqual(parseDate("October 15"), { day: 15, month: 10, year: undefined });
  assert.deepEqual(parseDate("15/10/26"), { day: 15, month: 10, year: 2026 });
  assert.equal(parseDate("soon"), null);
});

test("page ids do not depend on layout", () => {
  assert.equal(pageIdFor("/scenarios/energy/"), "energy.home");
  assert.equal(pageIdFor("/scenarios/energy/help/direct-debit/"), "energy.help.direct-debit");
  assert.equal(pageIdFor("/scenarios/practice-bank/transactions"), "bank.transactions");
  assert.equal(pageIdFor("/shop/"), "shop.home");
  assert.equal(pageIdFor("/checkout/success/"), "shop.checkout.success");
  assert.equal(pageIdFor("/courses/"), null);
  assert.equal(pageMatches("energy.help.scams", "energy.help.*"), true);
  assert.equal(pageMatches("energy.helpful", "energy.help.*"), false);
});

const done = (exerciseId: string, clean = true, minutesAgo = 1): HistoryItem => ({
  exerciseId,
  status: "completed",
  success: true,
  attempts: clean ? 1 : 4,
  helpUsed: !clean,
  startedAt: new Date(NOW.getTime() - minutesAgo * 60000).toISOString(),
});

test("new learners start with beginner tasks and move up as they succeed", () => {
  const beginners = EXERCISES.filter((exercise) => exercise.difficulty === "beginner").map((exercise) => exercise.id);
  assert.equal(learnerLevel([], EXERCISES), "beginner");
  assert.equal(learnerLevel(beginners.slice(0, 4).map((id) => done(id)), EXERCISES), "developing");
  const struggling = [done("energy.bill.days", false), done("energy.bill.period", false), done("energy.num.usage-rise", false), ...beginners.slice(0, 4).map((id) => done(id))];
  assert.equal(learnerLevel(struggling, EXERCISES), "beginner");

  const facts = buildFacts(sampleWorld(), NOW.toISOString());
  const top = rankExercises(EXERCISES, { environment: "energy", facts, history: [] }).slice(0, 5);
  assert.ok(top.every((item) => item.exercise.difficulty === "beginner"));
});

test("the next task is never one the learner has just done", () => {
  const facts = buildFacts(sampleWorld(), NOW.toISOString());
  const random = seeded(3);
  const history: HistoryItem[] = [];
  for (let round = 0; round < 40; round += 1) {
    const next = chooseNext(rankExercises(EXERCISES, { environment: "energy", facts, history }), random);
    assert.ok(next);
    assert.ok(!history.slice(0, 6).some((item) => item.exerciseId === next.id), `repeated ${next.id} in round ${round}`);
    history.unshift(done(next.id, true, 40 - round));
  }
  assert.equal(new Set(history.map((item) => item.exerciseId)).size, 40);
});

test("an exercise the learner struggled with comes back later", () => {
  const facts = buildFacts(sampleWorld(), NOW.toISOString());
  const struggled = done("energy.find.phone-number", false, 100);
  const others = EXERCISES.filter((exercise) => exercise.difficulty === "beginner" && exercise.id !== struggled.exerciseId)
    .slice(0, 6)
    .map((exercise, index) => done(exercise.id, true, 10 - index));
  const ranked = rankExercises(EXERCISES, { environment: "energy", facts, history: [...others, struggled] });
  const position = ranked.findIndex((item) => item.exercise.id === struggled.exerciseId);
  const cleanPosition = ranked.findIndex((item) => item.exercise.id === others[5].exerciseId);
  assert.ok(position < cleanPosition, "a struggled exercise should rank above one done cleanly");
});
