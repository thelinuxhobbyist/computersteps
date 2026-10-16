import { MAX_PAYMENT_PENCE, type Identity, type NewTransaction, type Random } from "./bank";
import { checkContactMessage } from "./messaging";
import type { BillStatus } from "./shared/energy-types";
import {
  CONTACT_TOPICS,
  DIRECT_DEBIT_FIRST_DAY,
  DIRECT_DEBIT_LAST_DAY,
  WESTFORD,
  type ContactTopic,
  type EnergyPaymentMethod,
} from "./shared/westford";

/** A calendar day, "YYYY-MM-DD". */
export type Day = string;

const pad = (value: number) => String(value).padStart(2, "0");

/** Months count from 1 and may overflow: month 0 is December of the year before. */
export function makeDay(year: number, month: number, day: number): Day {
  const date = new Date(Date.UTC(year, month - 1, day));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function splitDay(day: Day): { year: number; month: number; day: number } {
  const [year, month, date] = day.split("-").map(Number);
  return { year, month, day: date };
}

export function addDays(day: Day, count: number): Day {
  const { year, month, day: date } = splitDay(day);
  return makeDay(year, month, date + count);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function ukToday(now: Date): Day {
  const parts = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "numeric", day: "numeric", timeZone: "Europe/London" }).formatToParts(now);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return makeDay(get("year"), get("month"), get("day"));
}

export type NewBill = {
  reference: string;
  issuedOn: Day;
  periodStart: Day;
  periodEnd: Day;
  dueOn: Day;
  openingReading: number;
  closingReading: number;
  readingType: "actual" | "estimated";
  kwh: number;
  unitRatePence: number;
  standingChargePence: number;
  days: number;
  amountPence: number;
};

export type NewEnergyPayment = { paidAt: string; amountPence: number; method: EnergyPaymentMethod; reference: string };

export type NewReading = { readOn: Day; submittedAt: string; reading: number; source: "customer" | "estimated" | "meter-reader" };

export const HISTORY_BILLS = 6;

// Bills before the previous one. Fixed so every learner can compare the same pattern of use.
const OLDER_KWH = [205, 172, 196, 210];
const PAST_METHODS: EnergyPaymentMethod[] = ["card_online", "card_online", "card_phone", "bank_transfer", "card_online"];

/**
 * The latest bill is always £84.50 and the one before £62.00, whatever the month length:
 * at 25p a unit and 50p a day, the units used are worked out from the number of days.
 */
export function billKwh(billsBack: number, days: number): number {
  if (billsBack === 0) return 338 - 2 * days;
  if (billsBack === 1) return 248 - 2 * days;
  return OLDER_KWH[(billsBack - 2) % OLDER_KWH.length];
}

const between = (min: number, max: number, random: Random) => min + Math.floor(random() * (max - min + 1));
const digits = (count: number, random: Random) => Array.from({ length: count }, () => Math.floor(random() * 10)).join("");

export function makeEnergyAccountNumber(random: Random): string {
  return `WE${between(1, 9, random)}${digits(7, random)}`;
}

export function makePaymentReference(random: Random): string {
  return `WP${digits(7, random)}`;
}

/**
 * Six monthly bills. The latest covers last month, was sent a couple of days ago and is unpaid.
 * Every earlier bill was paid a few days before it was due.
 */
export function buildEnergyHistory(today: Day, random: Random) {
  const { year, month, day } = splitDay(today);
  const issueDay = day >= 3 ? day - 2 : 1;
  const { unitRatePence, standingChargePence } = WESTFORD.tariff;

  let reading = between(30000, 49000, random);
  const bills: NewBill[] = [];
  const payments: NewEnergyPayment[] = [];
  const readings: NewReading[] = [];

  for (let back = HISTORY_BILLS - 1; back >= 0; back -= 1) {
    const periodStart = makeDay(year, month - 1 - back, 1);
    const period = splitDay(periodStart);
    const days = daysInMonth(period.year, period.month);
    const periodEnd = makeDay(period.year, period.month, days);
    const issued = splitDay(makeDay(year, month - back, 1));
    const issuedOn = makeDay(issued.year, issued.month, Math.min(issueDay, daysInMonth(issued.year, issued.month)));
    const kwh = billKwh(back, days);
    const readingType = back === 0 ? "estimated" : "actual";

    bills.push({
      reference: `WB${digits(6, random)}`,
      issuedOn,
      periodStart,
      periodEnd,
      dueOn: addDays(issuedOn, WESTFORD.billDueDays),
      openingReading: reading,
      closingReading: reading + kwh,
      readingType,
      kwh,
      unitRatePence,
      standingChargePence,
      days,
      amountPence: kwh * unitRatePence + days * standingChargePence,
    });
    reading += kwh;
    readings.push({
      readOn: periodEnd,
      submittedAt: `${periodEnd}T18:00:00.000Z`,
      reading,
      source: readingType === "estimated" ? "estimated" : back % 2 === 0 ? "meter-reader" : "customer",
    });
  }

  bills.forEach((bill, index) => {
    const back = HISTORY_BILLS - 1 - index;
    if (back === 0) return;
    const paidOn = addDays(bill.dueOn, -(2 + (back % 3)));
    payments.push({
      paidAt: `${paidOn}T${pad(between(9, 17, random))}:${pad(between(0, 59, random))}:00.000Z`,
      amountPence: bill.amountPence,
      method: PAST_METHODS[(back - 1) % PAST_METHODS.length],
      reference: makePaymentReference(random),
    });
  });

  return {
    accountNumber: makeEnergyAccountNumber(random),
    meterSerial: `E${digits(2, random)}K${digits(5, random)}`,
    bills,
    payments,
    readings,
  };
}

/** How each energy payment appears in Practice Bank. */
export function bankTransactionFor(payment: NewEnergyPayment): NewTransaction {
  return {
    postedAt: payment.paidAt,
    description: WESTFORD.name,
    type: payment.method === "bank_transfer" ? "Bank transfer" : payment.method === "direct_debit" ? "Direct Debit" : "Card payment",
    category: "Bills",
    amountPence: -payment.amountPence,
    reference: payment.reference,
  };
}

type BillForStatus = { periodStart: Day; dueOn: Day; amountPence: number };
type PaymentForStatus = { paidAt: string; amountPence: number };

export type BillPaymentState = { paidPence: number; status: BillStatus; paidOn: Day | null; overdue: boolean };

/** Payments pay off the oldest bill first, as they would on a real account. */
export function billStatuses<B extends BillForStatus>(bills: B[], payments: PaymentForStatus[], today: Day): (B & BillPaymentState)[] {
  const ordered = [...bills].sort((a, b) => a.periodStart.localeCompare(b.periodStart));
  const paid = [...payments].sort((a, b) => a.paidAt.localeCompare(b.paidAt));
  const states = ordered.map((bill) => ({ ...bill, paidPence: 0, status: "unpaid" as BillStatus, paidOn: null as Day | null, overdue: false }));

  let billIndex = 0;
  for (const payment of paid) {
    let left = payment.amountPence;
    while (left > 0 && billIndex < states.length) {
      const bill = states[billIndex];
      const take = Math.min(left, bill.amountPence - bill.paidPence);
      bill.paidPence += take;
      left -= take;
      if (bill.paidPence >= bill.amountPence) {
        bill.paidOn = payment.paidAt.slice(0, 10);
        billIndex += 1;
      }
    }
  }

  return states.map((bill) => {
    const status: BillStatus = bill.paidPence >= bill.amountPence ? "paid" : bill.paidPence > 0 ? "part-paid" : "unpaid";
    return { ...bill, status, overdue: status !== "paid" && today > bill.dueOn };
  });
}

const squash = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const onlyDigits = (value: unknown) => (typeof value === "string" ? value.replace(/\D/g, "") : "");
const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export type FormErrors = Record<string, string>;

export function readPaymentAmount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value <= 0 || value > MAX_PAYMENT_PENCE) return null;
  return value;
}

export type DirectDebitRequest = { accountName: string; sortCode: string; accountNumber: string; day: number };

/** Checks a Direct Debit form against the learner's own Practice Bank account. */
export function checkDirectDebit(
  body: Record<string, unknown>,
  owner: Identity,
  bank: { sortCode: string; accountNumber: string },
): { request: DirectDebitRequest } | { errors: FormErrors } {
  const accountName = text(body.accountName, 60);
  const sortCode = onlyDigits(body.sortCode);
  const accountNumber = onlyDigits(body.accountNumber);
  const day = typeof body.day === "number" ? body.day : Number(body.day);
  const errors: FormErrors = {};

  if (!accountName) errors.accountName = "Type the name of the person who owns the bank account.";
  else if (squash(accountName) !== squash(owner.fullName)) {
    errors.accountName = "The name must match the name on the bank account. Check it in Practice Bank.";
  }

  if (sortCode.length !== 6) errors.sortCode = "A sort code has 6 numbers, like 00-12-34.";
  if (accountNumber.length !== 8) errors.accountNumber = "An account number has 8 numbers.";
  if (!errors.sortCode && !errors.accountNumber && (sortCode !== onlyDigits(bank.sortCode) || accountNumber !== bank.accountNumber)) {
    errors.accountNumber = "We could not find a bank account with this sort code and account number. Check both in Practice Bank.";
  }

  if (!Number.isInteger(day) || day < DIRECT_DEBIT_FIRST_DAY || day > DIRECT_DEBIT_LAST_DAY) {
    errors.day = `Choose a day between ${DIRECT_DEBIT_FIRST_DAY} and ${DIRECT_DEBIT_LAST_DAY}.`;
  }
  if (body.confirm !== true) errors.confirm = "Tick the box to confirm you are allowed to set up this Direct Debit.";

  if (Object.keys(errors).length > 0) return { errors };
  return { request: { accountName, sortCode: bank.sortCode, accountNumber, day } };
}

export const MAX_READING_JUMP = 5000;

export function checkMeterReading(body: Record<string, unknown>, lastActualReading: number): { reading: number } | { errors: FormErrors } {
  const raw = typeof body.reading === "string" ? body.reading.trim() : typeof body.reading === "number" ? String(body.reading) : "";
  if (!raw) return { errors: { reading: "Type the numbers shown on your meter." } };
  if (!/^\d{4,6}$/.test(raw.replace(/\s/g, ""))) {
    return { errors: { reading: "Type only the numbers on the meter, like 04682. Leave out any numbers in red or after a decimal point." } };
  }
  const reading = Number(raw.replace(/\s/g, ""));
  if (reading < lastActualReading) {
    return { errors: { reading: `This is lower than your last reading (${lastActualReading}). Check the numbers and try again.` } };
  }
  if (reading > lastActualReading + MAX_READING_JUMP) {
    return { errors: { reading: "This reading is much higher than we expected. Check the numbers and try again." } };
  }
  return { reading };
}

export function checkMessage(body: Record<string, unknown>): { topic: ContactTopic; message: string } | { errors: FormErrors } {
  const checked = checkContactMessage(body, CONTACT_TOPICS);
  if ("errors" in checked) return checked;
  return { topic: checked.topic as ContactTopic, message: checked.message };
}

export type TransferRequest =
  | { payee: "westford"; amountPence: number; reference: string }
  | { payee: "other"; amountPence: number; reference: string; payeeName: string };

/**
 * A bank transfer from Practice Bank.
 * Westford Energy is recognised so the payment can be applied to the energy bill.
 * It needs the energy account number as the reference. Any other sort code and account number is paid as a normal transfer.
 */
export function checkTransfer(
  body: Record<string, unknown>,
  energyAccountNumber: string | null,
  ownBank?: { sortCode: string; accountNumber: string },
): { request: TransferRequest } | { errors: FormErrors } {
  const payeeName = text(body.payeeName, 60);
  const sortCode = onlyDigits(body.sortCode);
  const accountNumber = onlyDigits(body.accountNumber);
  const reference = text(body.reference, 30).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const amountPence = readPaymentAmount(body.amountPence);
  const errors: FormErrors = {};

  if (!payeeName) errors.payeeName = "Type the name of the person or company you are paying.";
  if (sortCode.length !== 6) errors.sortCode = "A sort code has 6 numbers, like 00-12-34.";
  if (accountNumber.length !== 8) errors.accountNumber = "An account number has 8 numbers.";

  const isOwn = ownBank != null && sortCode === onlyDigits(ownBank.sortCode) && accountNumber === ownBank.accountNumber;
  if (!errors.sortCode && !errors.accountNumber && isOwn) {
    errors.accountNumber = "This is your own account. Give these details to someone who is paying you.";
  }

  const isWestford = sortCode === onlyDigits(WESTFORD.bankDetails.sortCode) && accountNumber === WESTFORD.bankDetails.accountNumber;
  if (isWestford && payeeName && !squash(payeeName).includes("westford")) {
    errors.payeeName = "The name does not match this account. Check the name of the company you are paying.";
  }

  if (!reference) errors.reference = "Add a reference so the company knows the payment is from you.";
  else if (isWestford && energyAccountNumber && reference !== energyAccountNumber) {
    errors.reference = "Westford Energy needs your energy account number as the reference. You can find it on your bill.";
  } else if (isWestford && !energyAccountNumber) {
    errors.reference = "Westford Energy cannot find an account with this reference. Log in to Westford Energy first.";
  }

  if (amountPence === null) errors.amountPence = "Type how much to pay, like 25.00.";

  if (Object.keys(errors).length > 0 || amountPence === null) return { errors };
  if (isWestford) return { request: { payee: "westford", amountPence, reference } };
  return { request: { payee: "other", amountPence, reference, payeeName } };
}
