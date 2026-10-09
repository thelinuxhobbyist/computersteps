import type { AnswerSpec, Facts, Mistake, NumberUnit, ValueRef } from "./types";
import { allHold, resolve, type Scalar } from "./values";

export type Answer = string | string[];
export type CheckResult = { correct: boolean; feedback?: string };

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const squash = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const digitsOf = (value: string) => value.replace(/\D/g, "");
const single = (answer: Answer) => (Array.isArray(answer) ? (answer[0] ?? "") : answer).trim();

/**
 * Reads what the learner typed as a number in the exercise's unit.
 * Money answers come back in pence, so "£84.50", "84.5" and "84.50p" all give 8450.
 */
export function parseNumber(raw: string, unit: NumberUnit): number | null {
  const cleaned = raw.toLowerCase().replace(/,/g, "").replace(/\s+/g, " ").trim();
  const match = cleaned.match(/-?\d+(\.\d+)?|-?\.\d+/);
  if (!match) return null;
  const value = Number(match[0]);
  if (!Number.isFinite(value)) return null;
  if (unit === "money") return Math.round(value * 100);
  if (unit === "pence" && (cleaned.includes("£") || /^0?\.\d+/.test(match[0]))) return Math.round(value * 100);
  return value;
}

export type DayMonth = { day: number; month: number; year?: number };

/** Understands "15 October", "15th Oct 2026", "October 15", "Thursday 15 October" and "15/10/26". */
export function parseDate(raw: string): DayMonth | null {
  const lower = raw.toLowerCase();
  const monthWord = lower.match(/[a-z]{3,}/g)?.map((word) => MONTHS.indexOf(word.slice(0, 3))).find((index) => index >= 0);
  const numbers = (lower.match(/\d+/g) ?? []).map(Number);

  if (monthWord !== undefined) {
    const day = numbers.find((value) => value >= 1 && value <= 31);
    if (day === undefined) return null;
    const year = numbers.find((value) => value > 31);
    return { day, month: monthWord + 1, year: year === undefined ? undefined : year < 100 ? 2000 + year : year };
  }

  if (numbers.length >= 2) {
    const [day, month, year] = numbers;
    if (day < 1 || day > 31 || month < 1 || month > 12) return null;
    return { day, month, year: year === undefined ? undefined : year < 100 ? 2000 + year : year };
  }
  return null;
}

function mistakeFeedback(mistakes: Mistake[] | undefined, facts: Facts, matches: (value: Scalar) => boolean): string | undefined {
  for (const mistake of mistakes ?? []) {
    try {
      if (matches(resolve(mistake.value, facts))) return mistake.feedback;
    } catch {
      // A mistake that refers to a missing fact simply cannot happen for this learner.
    }
  }
  return undefined;
}

const DEFAULT_TOLERANCE: Record<NumberUnit, number> = { money: 0, kWh: 0, pence: 0, days: 0, count: 0, reading: 0 };

function checkNumber(spec: Extract<AnswerSpec, { type: "number" }>, answer: Answer, facts: Facts): CheckResult {
  const given = parseNumber(single(answer), spec.unit);
  if (given === null) return { correct: false, feedback: "Type your answer as a number." };
  const tolerance = spec.tolerance ?? DEFAULT_TOLERANCE[spec.unit];
  const close = (value: Scalar) => typeof value === "number" && Math.abs(given - value) <= tolerance + 1e-9;
  const accepted: ValueRef[] = [spec.value, ...(spec.alsoAccept ?? [])];
  if (accepted.some((ref) => close(resolve(ref, facts)))) return { correct: true };
  return { correct: false, feedback: mistakeFeedback(spec.mistakes, facts, close) };
}

function checkText(spec: Extract<AnswerSpec, { type: "text" }>, answer: Answer, facts: Facts): CheckResult {
  const given = single(answer);
  if (!given) return { correct: false, feedback: "Type your answer in the box." };
  const same = (value: Scalar) => {
    const expected = String(value);
    if (spec.compare === "digits") return digitsOf(given) !== "" && digitsOf(given) === digitsOf(expected);
    if (spec.compare === "contains") return squash(expected) !== "" && squash(given).includes(squash(expected));
    return squash(given) === squash(expected);
  };
  if (spec.accept.some((ref) => same(resolve(ref, facts)))) return { correct: true };
  return { correct: false, feedback: mistakeFeedback(spec.mistakes, facts, same) };
}

function checkDate(spec: Extract<AnswerSpec, { type: "date" }>, answer: Answer, facts: Facts): CheckResult {
  const given = parseDate(single(answer));
  if (!given) return { correct: false, feedback: "Type the date with the day and the month, like 15 October." };
  const same = (value: Scalar) => {
    const [year, month, day] = String(value).split("-").map(Number);
    return given.day === day && given.month === month && (given.year === undefined || given.year === year);
  };
  if (same(resolve(spec.value, facts))) return { correct: true };
  return { correct: false, feedback: mistakeFeedback(spec.mistakes, facts, same) };
}

export function correctOptions(spec: Extract<AnswerSpec, { type: "choice" }>, facts: Facts): string[] {
  if (Array.isArray(spec.correct)) return spec.correct;
  return String(resolve(spec.correct, facts)).split(",").filter(Boolean);
}

function checkChoice(spec: Extract<AnswerSpec, { type: "choice" }>, answer: Answer, facts: Facts): CheckResult {
  const chosen = [...new Set(Array.isArray(answer) ? answer : [answer])].filter(Boolean);
  if (chosen.length === 0) return { correct: false, feedback: spec.multiple ? "Choose at least one answer." : "Choose an answer." };
  const correct = correctOptions(spec, facts);
  const wrong = chosen.filter((id) => !correct.includes(id));
  const missing = correct.filter((id) => !chosen.includes(id));
  if (wrong.length === 0 && missing.length === 0) return { correct: true };

  const specific = spec.mistakes?.find((mistake) => wrong.includes(mistake.option))?.feedback;
  if (specific) return { correct: false, feedback: specific };
  if (spec.multiple && wrong.length === 0) return { correct: false, feedback: "You have found some of them. There are more to find." };
  if (spec.multiple && missing.length === 0) return { correct: false, feedback: "You have found them all, but one or more of your choices is not right." };
  return { correct: false };
}

function checkYesNo(spec: Extract<AnswerSpec, { type: "yes_no" }>, answer: Answer, facts: Facts): CheckResult {
  const given = squash(single(answer));
  if (given !== "yes" && given !== "no") return { correct: false, feedback: "Choose Yes or No." };
  const expected =
    typeof spec.correct === "boolean" ? spec.correct : "when" in spec.correct ? allHold(spec.correct.when, facts) : resolve(spec.correct, facts) === true;
  return { correct: (given === "yes") === expected };
}

/** Typed answers only. Actions and navigation are checked from what the learner did. */
export function checkAnswer(spec: AnswerSpec, answer: Answer, facts: Facts): CheckResult {
  switch (spec.type) {
    case "number":
      return checkNumber(spec, answer, facts);
    case "text":
      return checkText(spec, answer, facts);
    case "date":
      return checkDate(spec, answer, facts);
    case "choice":
      return checkChoice(spec, answer, facts);
    case "yes_no":
      return checkYesNo(spec, answer, facts);
    case "action":
    case "navigation":
      return { correct: false, feedback: "This task is checked from what you do on the website." };
  }
}
