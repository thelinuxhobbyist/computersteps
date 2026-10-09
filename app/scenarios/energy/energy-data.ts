import type { EnergyBill } from "../../../workers/practice-bank/src/shared/energy-types";

export type {
  EnergyAccount,
  EnergyBill,
  EnergyMessage,
  EnergyPayment,
  EnergyReading,
} from "../../../workers/practice-bank/src/shared/energy-types";
export { messageStatusLabel } from "../../../workers/practice-bank/src/messaging";
export {
  BILL_ENQUIRY_TOPICS,
  CONTACT_TOPICS,
  DIRECT_DEBIT_FIRST_DAY,
  DIRECT_DEBIT_LAST_DAY,
  OPENING_HOURS,
  PAYMENT_METHOD_LABELS,
  SUPPORT_HOURS,
  WESTFORD,
  contactTopicLabel,
} from "../../../workers/practice-bank/src/shared/westford";

export const ENERGY_BASE = "/scenarios/energy";

export const ENERGY_NAV = [
  { label: "Home", href: `${ENERGY_BASE}/` },
  { label: "My Account", href: `${ENERGY_BASE}/account/` },
  { label: "Bills", href: `${ENERGY_BASE}/bills/` },
  { label: "Payments", href: `${ENERGY_BASE}/payments/` },
  { label: "Energy Usage", href: `${ENERGY_BASE}/usage/` },
  { label: "Help & Support", href: `${ENERGY_BASE}/help/` },
  { label: "Contact Us", href: `${ENERGY_BASE}/contact/` },
];

const dayDate = (day: string) => {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date, 12));
};

/** "2026-10-15" becomes "15 October 2026". */
export function formatDay(day: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(dayDate(day));
}

export function formatShortDay(day: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(dayDate(day));
}

export function monthOf(day: string): string {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(dayDate(day));
}

/** The UK calendar day of a timestamp. */
export function dayOf(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/London" }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function ordinal(day: number): string {
  const teen = day % 100 >= 11 && day % 100 <= 13;
  const suffix = teen ? "th" : day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th";
  return `${day}${suffix}`;
}

export function formatPence(pence: number): string {
  return `${pence}p`;
}

export function billStatusText(bill: EnergyBill): string {
  if (bill.status === "paid") return bill.paidOn ? `Paid on ${formatDay(bill.paidOn)}` : "Paid";
  if (bill.status === "part-paid") return bill.overdue ? "Part paid – overdue" : "Part paid";
  return bill.overdue ? "Overdue" : "Not paid yet";
}

/** Pounds as typed, like "84.50" or "£20", into pence. Null if it is not a sensible amount. */
export function readPounds(value: string): number | null {
  const cleaned = value.replace(/[£,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const pence = Math.round(Number(cleaned) * 100);
  return pence > 0 ? pence : null;
}

export function poundsInput(pence: number): string {
  return (pence / 100).toFixed(2);
}
