import type { PracticeMessage } from "./messaging-types";
import type { EnergyPaymentMethod } from "./westford";

export type { PracticeMessage } from "./messaging-types";

/** Dates without a time are "YYYY-MM-DD" in UK time. Timestamps are ISO strings. */

export type BillStatus = "paid" | "part-paid" | "unpaid";

export type EnergyBill = {
  id: number;
  reference: string;
  issuedOn: string;
  periodStart: string;
  periodEnd: string;
  dueOn: string;
  openingReading: number;
  closingReading: number;
  readingType: "actual" | "estimated";
  kwh: number;
  unitRatePence: number;
  standingChargePence: number;
  days: number;
  energyChargePence: number;
  standingTotalPence: number;
  amountPence: number;
  paidPence: number;
  status: BillStatus;
  /** The day the bill was fully paid. */
  paidOn: string | null;
  overdue: boolean;
};

export type EnergyPayment = {
  id: number;
  paidAt: string;
  amountPence: number;
  method: EnergyPaymentMethod;
  reference: string;
};

export type EnergyReading = {
  id: number;
  readOn: string;
  submittedAt: string;
  reading: number;
  source: "customer" | "estimated" | "meter-reader";
};

export type EnergyMessage = PracticeMessage;

export type DirectDebit = { accountName: string; sortCode: string; accountNumberEnding: string; day: number; setUpAt: string };

export type EnergyAccount = {
  username: string;
  fullName: string;
  addressLine1: string;
  townOrCity: string;
  postcode: string;
  accountNumber: string;
  meterSerial: string;
  tariffName: string;
  unitRatePence: number;
  standingChargePence: number;
  directDebit: DirectDebit | null;
  /** Positive when money is owed, negative when the account is in credit. */
  balancePence: number;
  /** Newest first. */
  bills: EnergyBill[];
  payments: EnergyPayment[];
  readings: EnergyReading[];
  messages: EnergyMessage[];
  /** True when money is owed and the learner has not yet written about the bill. */
  billAttention: boolean;
  createdAt: string;
  today: string;
};
