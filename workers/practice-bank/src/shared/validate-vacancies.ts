import { JOB_CATEGORIES, rightToWorkText, type JobCategory, type VacancyInput } from "./jobs.ts";

const CATEGORIES = new Set<string>(JOB_CATEGORIES.map((item) => item.id));
const HOURS = new Set(["full-time", "part-time"]);
const CONTRACTS = new Set(["permanent", "temporary", "fixed-term", "contract"]);
const WORKPLACES = new Set(["on-site", "hybrid", "remote"]);
const EXPERIENCE = new Set(["entry", "some", "experienced"]);
const PERIODS = new Set(["year", "hour", "day", "week", "task"]);

function isoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function filled(values: string[] | undefined): boolean {
  return Boolean(values?.length && values.every((item) => item.trim().length > 0));
}

export function validateVacancyInput(input: VacancyInput, seen: Set<string>): string[] {
  const errors: string[] = [];
  const id = input.id?.trim().toLowerCase() ?? "";
  if (!/^wfj-\d+$/.test(id)) errors.push("id must look like wfj-2001");
  if (seen.has(id)) errors.push("duplicate id");
  seen.add(id);
  if (!input.title?.trim()) errors.push("missing title");
  if (!input.employer?.trim()) errors.push("missing employer");
  if (!CATEGORIES.has(input.category)) errors.push("invalid category");
  if (!input.town?.trim() || !input.city?.trim()) errors.push("missing town or city");
  if (input.workplace !== "remote" && !/^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/.test(input.postcode)) errors.push("invalid postcode");
  if (!PERIODS.has(input.payPeriod)) errors.push("invalid pay period");
  if (!(input.payMin > 0) || input.payMax < input.payMin) errors.push("pay min and max are inconsistent");
  if (!input.suspicious && input.payPeriod === "hour" && (input.payMin < 11 || input.payMax > 45)) errors.push("hourly pay looks inconsistent");
  if (!input.suspicious && input.payPeriod === "year" && (input.payMin < 14000 || input.payMax > 80000)) errors.push("yearly pay looks inconsistent");
  if (!(input.hoursPerWeek > 0) || input.hoursPerWeek > 48) errors.push("hours per week look inconsistent");
  if (!HOURS.has(input.hours)) errors.push("invalid hours");
  if (input.hours === "part-time" && input.hoursPerWeek >= 35) errors.push("part-time hours are full-time");
  if (input.hours === "full-time" && input.hoursPerWeek < 30) errors.push("full-time hours are too low");
  if (!input.hoursDetail?.trim()) errors.push("missing working pattern");
  if (!CONTRACTS.has(input.contract) || !WORKPLACES.has(input.workplace) || !EXPERIENCE.has(input.experience)) errors.push("invalid contract, workplace or experience");
  if (!input.summary?.trim() || input.summary.trim().length < 40) errors.push("summary is too short");
  if (!filled(input.responsibilities) || !filled(input.essential) || !filled(input.desirable) || !filled(input.qualifications)) {
    errors.push("requirements are incomplete");
  }
  if (!isoDate(input.postedOn) || !isoDate(input.closesOn) || input.closesOn < input.postedOn) errors.push("dates are missing or contradictory");
  const requirements = [...input.essential, ...input.qualifications].join(" ");
  if (input.experience === "entry" && /at least \d+ year|(\d+) years' experience/i.test(input.essential.join(" "))) {
    errors.push("entry-level essential list still demands years of experience");
  }
  if (input.sponsorship === "available") {
    if (!input.sponsorshipCondition?.trim()) errors.push("sponsorship is offered without a condition");
    else if (!requirements.toLowerCase().includes(input.sponsorshipCondition.trim().toLowerCase())) {
      errors.push("sponsorship condition is not in the requirements");
    }
  }
  if (input.sponsorship === "available" && !rightToWorkText(input).includes("Sponsorship may be available")) {
    errors.push("sponsorship wording does not match the flag");
  }
  if ((input.sponsorship ?? "not-offered") === "not-offered" && input.rightToWork?.toLowerCase().includes("sponsorship may be available")) {
    errors.push("right-to-work text offers sponsorship the flag does not");
  }
  if (input.apprenticeship && !/apprentice/i.test(`${input.title} ${input.summary}`)) errors.push("apprenticeship is not mentioned");
  return errors.map((error) => `${id || "unknown"}: ${error}`);
}

export function validateVacancyList(inputs: readonly VacancyInput[]): string[] {
  const seen = new Set<string>();
  const fingerprints = new Map<string, string>();
  const summaries = new Map<string, string>();
  const errors: string[] = [];
  for (const input of inputs) {
    errors.push(...validateVacancyInput(input, seen));
    const fingerprint = [input.title, input.employer, input.town].join("|").toLowerCase();
    const previous = fingerprints.get(fingerprint);
    if (previous) errors.push(`${input.id}: repeats ${previous}`);
    fingerprints.set(fingerprint, input.id);
    const summary = input.summary?.trim();
    const sameSummary = summaries.get(summary);
    if (summary && sameSummary) errors.push(`${input.id}: summary repeats ${sameSummary}`);
    if (summary) summaries.set(summary, input.id);
  }
  return errors;
}

export function isJobCategory(value: string): value is JobCategory {
  return CATEGORIES.has(value);
}
