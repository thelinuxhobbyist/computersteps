import type { Condition, FactValue, Facts, ValueRef } from "./types";

export class MissingFact extends Error {
  constructor(name: string) {
    super(`Unknown fact: ${name}`);
  }
}

export type Scalar = number | string | boolean;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatPence(pence: number): string {
  const pounds = (Math.abs(pence) / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${pence < 0 ? "-" : ""}£${pounds}`;
}

/** "2026-10-15" becomes "15 October". */
export function formatDay(day: string): string {
  const [, month, date] = day.split("-").map(Number);
  return `${date} ${MONTHS[month - 1]}`;
}

export function monthName(day: string): string {
  return MONTHS[Number(day.split("-")[1]) - 1];
}

export function getFact(facts: Facts, name: string): FactValue {
  const fact = facts[name];
  if (!fact) throw new MissingFact(name);
  return fact;
}

function factScalar(fact: FactValue): Scalar {
  switch (fact.kind) {
    case "money":
      return fact.pence;
    case "number":
      return fact.value;
    case "date":
      return fact.day;
    case "text":
      return fact.value;
    case "bool":
      return fact.value;
  }
}

const asNumber = (value: Scalar) => {
  if (typeof value !== "number") throw new Error(`Expected a number, got ${String(value)}`);
  return value;
};

/** Money is in pence, so literal amounts in exercises are written in pence too. */
export function resolve(ref: ValueRef, facts: Facts): Scalar {
  if (typeof ref !== "object") return ref;
  if ("fact" in ref) return factScalar(getFact(facts, ref.fact));
  if ("add" in ref) return ref.add.reduce<number>((sum, item) => sum + asNumber(resolve(item, facts)), 0);
  if ("sub" in ref) {
    const [first, ...rest] = ref.sub;
    return rest.reduce<number>((total, item) => total - asNumber(resolve(item, facts)), asNumber(resolve(first, facts)));
  }
  if ("mul" in ref) return asNumber(resolve(ref.mul[0], facts)) * asNumber(resolve(ref.mul[1], facts));
  return asNumber(resolve(ref.div[0], facts)) / asNumber(resolve(ref.div[1], facts));
}

/** False, rather than an error, when a fact does not exist: "has a shop purchase" is simply not true yet. */
export function holds(condition: Condition, facts: Facts): boolean {
  try {
    const actual = resolve({ fact: condition.fact }, facts);
    if (condition.equals !== undefined && actual !== resolve(condition.equals, facts)) return false;
    if (condition.notEquals !== undefined && actual === resolve(condition.notEquals, facts)) return false;
    if (condition.atLeast !== undefined && asNumber(actual) < asNumber(resolve(condition.atLeast, facts))) return false;
    if (condition.atMost !== undefined && asNumber(actual) > asNumber(resolve(condition.atMost, facts))) return false;
    return true;
  } catch (error) {
    if (error instanceof MissingFact) return false;
    throw error;
  }
}

export function allHold(conditions: Condition[] | undefined, facts: Facts): boolean {
  return (conditions ?? []).every((condition) => holds(condition, facts));
}

export function formatFact(fact: FactValue): string {
  switch (fact.kind) {
    case "money":
      return formatPence(fact.pence);
    case "number":
      return fact.unit ? `${fact.value.toLocaleString("en-GB")} ${fact.unit}` : String(fact.value);
    case "date":
      return formatDay(fact.day);
    case "text":
      return fact.value;
    case "bool":
      return fact.value ? "yes" : "no";
  }
}

/** Fills in "{person.firstName}" and other facts. Throws if the template names a fact that does not exist. */
export function render(template: string, facts: Facts): string {
  return template.replace(/\{([a-zA-Z0-9_.]+)\}/g, (_match, name: string) => formatFact(getFact(facts, name)));
}

/** Every fact a template or value refers to, for checking the library. */
export function factNamesIn(value: unknown): string[] {
  if (typeof value === "string") return [...value.matchAll(/\{([a-zA-Z0-9_.]+)\}/g)].map((match) => match[1]);
  if (Array.isArray(value)) return value.flatMap(factNamesIn);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => (key === "fact" && typeof item === "string" ? [item] : factNamesIn(item)));
  }
  return [];
}
