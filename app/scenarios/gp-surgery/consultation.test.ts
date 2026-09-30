import test from "node:test";
import assert from "node:assert/strict";

import {
  EMPTY_ANSWERS,
  PRACTICE_PATIENT,
  isValidDateOfBirth,
  isValidUkPhone,
  makeReference,
  validateStep,
  type ConsultationAnswers,
} from "./consultation";

const today = new Date(2026, 8, 30);

const detailsFromCard: ConsultationAnswers = {
  ...EMPTY_ANSWERS,
  firstName: PRACTICE_PATIENT.firstName,
  lastName: PRACTICE_PATIENT.lastName,
  dobDay: "14",
  dobMonth: "3",
  dobYear: "1985",
  phone: PRACTICE_PATIENT.phone,
  email: PRACTICE_PATIENT.email,
  contactMethod: "text",
};

test("the first step needs who it is for and a reason", () => {
  assert.deepEqual(Object.keys(validateStep("reason", EMPTY_ANSWERS)).sort(), ["forWhom", "reason"]);
  assert.deepEqual(validateStep("reason", { ...EMPTY_ANSWERS, forWhom: "me", reason: "admin" }), {});
});

test("medical problems ask how long, whether it is new and whether it is changing", () => {
  const errors = validateStep("problem", { ...EMPTY_ANSWERS, reason: "new-problem", description: "Sore throat for three days", helpWanted: "An appointment" });
  assert.deepEqual(Object.keys(errors).sort(), ["change", "duration", "isNew"]);
});

test("admin requests skip the medical questions", () => {
  const errors = validateStep("problem", { ...EMPTY_ANSWERS, reason: "admin", description: "I need a fit note for work", helpWanted: "A fit note or letter" });
  assert.deepEqual(errors, {});
});

test("a very short description asks for more detail", () => {
  const errors = validateStep("problem", { ...EMPTY_ANSWERS, reason: "admin", description: "help", helpWanted: "I'm not sure" });
  assert.match(errors.description ?? "", /a little more/);
});

test("the practice patient's details are accepted", () => {
  assert.deepEqual(validateStep("details", detailsFromCard), {});
});

test("email is needed when it is the chosen contact method", () => {
  assert.ok(validateStep("details", { ...detailsFromCard, email: "", contactMethod: "email" }).email);
  assert.deepEqual(validateStep("details", { ...detailsFromCard, email: "", contactMethod: "phone" }), {});
});

test("rejects impossible or future dates of birth", () => {
  assert.equal(isValidDateOfBirth("14", "3", "1985", today), true);
  assert.equal(isValidDateOfBirth("31", "2", "1985", today), false);
  assert.equal(isValidDateOfBirth("1", "1", "2030", today), false);
  assert.equal(isValidDateOfBirth("a", "1", "1985", today), false);
});

test("accepts UK phone numbers with spaces or +44", () => {
  assert.equal(isValidUkPhone("07700 900123"), true);
  assert.equal(isValidUkPhone("+44 7700 900123"), true);
  assert.equal(isValidUkPhone("01632 960 482"), true);
  assert.equal(isValidUkPhone("12345"), false);
});

test("the final step needs the emergency confirmation", () => {
  assert.ok(validateStep("check", EMPTY_ANSWERS).confirmedNotUrgent);
  assert.deepEqual(validateStep("check", { ...EMPTY_ANSWERS, confirmedNotUrgent: true }), {});
});

test("reference numbers look like RMC-123456", () => {
  assert.equal(makeReference(() => 0), "RMC-100000");
  assert.match(makeReference(), /^RMC-\d{6}$/);
});
