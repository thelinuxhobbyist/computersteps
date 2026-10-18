import type { BankAccountView } from "../accounts";
import { makeDay, splitDay, ukToday } from "../energy";
import type { EnergyAccount, EnergyBill } from "../shared/energy-types";
import { CONTACT_TOPICS, PAYMENT_METHOD_LABELS, WESTFORD } from "../shared/westford";
import type { Facts } from "./types";
import { monthName } from "./values";

export type LearnerWorld = { bank: BankAccountView; energy: EnergyAccount | null; now: Date };

const money = (pence: number) => ({ kind: "money", pence }) as const;
const num = (value: number, unit?: string) => ({ kind: "number", value, unit }) as const;
const day = (value: string) => ({ kind: "date", day: value }) as const;
const text = (value: string) => ({ kind: "text", value }) as const;
const bool = (value: boolean) => ({ kind: "bool", value }) as const;

const ukDayOf = (iso: string) => ukToday(new Date(iso));

/** How far past the last real meter reading the "reading on the meter today" is. */
export const READING_SINCE_LAST_BILL = 241;

function billFacts(facts: Facts, prefix: string, bill: EnergyBill) {
  facts[`${prefix}.amount`] = money(bill.amountPence);
  facts[`${prefix}.reference`] = text(bill.reference);
  facts[`${prefix}.issued`] = day(bill.issuedOn);
  facts[`${prefix}.due`] = day(bill.dueOn);
  facts[`${prefix}.periodStart`] = day(bill.periodStart);
  facts[`${prefix}.periodEnd`] = day(bill.periodEnd);
  facts[`${prefix}.month`] = text(monthName(bill.periodStart));
  facts[`${prefix}.kwh`] = num(bill.kwh, "kWh");
  facts[`${prefix}.days`] = num(bill.days, "days");
  facts[`${prefix}.energyCharge`] = money(bill.energyChargePence);
  facts[`${prefix}.standingCharge`] = money(bill.standingTotalPence);
  facts[`${prefix}.openingReading`] = num(bill.openingReading);
  facts[`${prefix}.closingReading`] = num(bill.closingReading);
  facts[`${prefix}.paid`] = bool(bill.status === "paid");
  facts[`${prefix}.partPaid`] = bool(bill.status === "part-paid");
  facts[`${prefix}.overdue`] = bool(bill.overdue);
  facts[`${prefix}.estimated`] = bool(bill.readingType === "estimated");
  facts[`${prefix}.actualReading`] = bool(bill.readingType === "actual");
  if (bill.paidOn) facts[`${prefix}.paidOn`] = day(bill.paidOn);
}

function energyFacts(facts: Facts, energy: EnergyAccount, since: string | null) {
  const [bill, prev] = energy.bills;
  facts["energy.accountNumber"] = text(energy.accountNumber);
  facts["energy.meterSerial"] = text(energy.meterSerial);
  facts["energy.tariffName"] = text(energy.tariffName);
  facts["energy.balance"] = money(Math.max(energy.balancePence, 0));
  facts["energy.owes"] = bool(energy.balancePence > 0);
  facts["energy.unitRate"] = num(energy.unitRatePence, "p");
  facts["energy.standingChargePerDay"] = num(energy.standingChargePence, "p");
  facts["energy.billCount"] = num(energy.bills.length);
  facts["energy.directDebit"] = bool(energy.directDebit !== null);
  if (energy.directDebit) facts["energy.directDebitDay"] = num(energy.directDebit.day);

  if (bill) billFacts(facts, "energy.bill", bill);
  if (prev) billFacts(facts, "energy.prevBill", prev);
  if (bill && prev) {
    facts["energy.billDifference"] = money(bill.amountPence - prev.amountPence);
    facts["energy.bill.comparedToPrevious"] = text(bill.amountPence > prev.amountPence ? "higher" : bill.amountPence < prev.amountPence ? "lower" : "same");
    facts["energy.usage.rise"] = num(bill.kwh - prev.kwh, "kWh");
  }
  facts["energy.billsTotalLast3"] = money(energy.bills.slice(0, 3).reduce((sum, item) => sum + item.amountPence, 0));

  // energy.usage.0 is the latest month. Bills and usage are the same months.
  const paidMethods = energy.bills.map((item) => energy.payments.find((payment) => item.paidOn && ukDayOf(payment.paidAt) === item.paidOn)?.method);
  energy.bills.forEach((item, index) => {
    facts[`energy.usage.${index}.month`] = text(monthName(item.periodStart));
    facts[`energy.usage.${index}.kwh`] = num(item.kwh, "kWh");
  });
  const ranked = energy.bills.map((item, index) => ({ id: `u${index}`, kwh: item.kwh, month: monthName(item.periodStart) })).sort((a, b) => b.kwh - a.kwh);
  if (ranked.length > 0) {
    facts["energy.usage.highestId"] = text(ranked[0].id);
    facts["energy.usage.highestMonth"] = text(ranked[0].month);
    facts["energy.usage.lowestId"] = text(ranked[ranked.length - 1].id);
    facts["energy.usage.lowestMonth"] = text(ranked[ranked.length - 1].month);
    facts["energy.usage.top3Ids"] = text(ranked.slice(0, 3).map((item) => item.id).join(","));
    facts["energy.usage.total"] = num(energy.bills.reduce((sum, item) => sum + item.kwh, 0), "kWh");
  }
  const phoneIndex = paidMethods.indexOf("card_phone");
  if (phoneIndex >= 0) facts["energy.phonePaidBillId"] = text(`u${phoneIndex}`);

  facts["energy.payments.count"] = num(energy.payments.length);
  const [lastPayment] = energy.payments;
  if (lastPayment) {
    facts["energy.lastPayment.amount"] = money(lastPayment.amountPence);
    facts["energy.lastPayment.date"] = day(ukDayOf(lastPayment.paidAt));
    facts["energy.lastPayment.method"] = text(PAYMENT_METHOD_LABELS[lastPayment.method]);
  }

  const lastActual = energy.readings.find((reading) => reading.source !== "estimated");
  if (lastActual) facts["energy.lastActualReading"] = num(lastActual.reading);
  const lastCustomer = energy.readings.find((reading) => reading.source === "customer");
  if (lastCustomer) facts["energy.lastCustomerReading"] = num(lastCustomer.reading);
  if (prev) facts["energy.readingToSubmit"] = num(prev.closingReading + READING_SINCE_LAST_BILL);

  if (since) {
    const newPayments = energy.payments.filter((payment) => payment.paidAt >= since);
    facts["energy.since.paid"] = money(newPayments.reduce((sum, payment) => sum + payment.amountPence, 0));
    facts["energy.since.cardPayments"] = num(newPayments.filter((payment) => payment.method === "card_online").length);
    facts["energy.since.bankTransfers"] = num(newPayments.filter((payment) => payment.method === "bank_transfer").length);
    const newReadings = energy.readings.filter((reading) => reading.source === "customer" && reading.submittedAt >= since);
    facts["energy.since.readings"] = num(newReadings.length);
    if (newReadings[0]) facts["energy.since.lastReading"] = num(newReadings[0].reading);
    facts["energy.since.directDebitSetUp"] = bool(energy.directDebit !== null && energy.directDebit.setUpAt >= since);
    const newMessages = energy.messages.filter((message) => message.sentAt >= since);
    facts["energy.since.messages"] = num(newMessages.length);
    for (const topic of CONTACT_TOPICS) {
      facts[`energy.since.message.${topic.id}`] = num(newMessages.filter((message) => message.topic === topic.id).length);
    }
  }
}

function bankFacts(facts: Facts, bank: BankAccountView, energy: EnergyAccount | null, now: Date, since: string | null) {
  facts["bank.balance"] = money(bank.balancePence);
  facts["bank.sortCode"] = text(bank.sortCode);
  facts["bank.accountNumber"] = text(bank.accountNumber);
  facts["bank.cardLast4"] = text(bank.cardNumber.slice(-4));

  const newestFirst = [...bank.transactions].sort((a, b) => b.postedAt.localeCompare(a.postedAt) || b.id - a.id);
  const energyPayments = newestFirst.filter((transaction) => transaction.description === WESTFORD.name);
  // The same window as Westford Bank's "Last 6 months" filter.
  const { year, month } = splitDay(ukToday(now));
  const sixMonthsAgo = makeDay(year, month - 6, 1);
  facts["bank.energyPayments.count"] = num(energyPayments.filter((transaction) => ukDayOf(transaction.postedAt) >= sixMonthsAgo).length);
  if (energyPayments[0]) {
    facts["bank.lastEnergyPayment.amount"] = money(-energyPayments[0].amountPence);
    facts["bank.lastEnergyPayment.date"] = day(ukDayOf(energyPayments[0].postedAt));
  }

  const shop = newestFirst.find(
    (transaction) => transaction.description === "Westford Foods" || transaction.description === "Practice Shop",
  );
  facts["bank.hasShopPurchase"] = bool(Boolean(shop));
  if (shop) {
    facts["bank.lastShopPurchase.amount"] = money(-shop.amountPence);
    facts["bank.lastShopPurchase.date"] = day(ukDayOf(shop.postedAt));
  }

  const rent = newestFirst.find((transaction) => transaction.description.includes("(rent)"));
  if (rent) facts["bank.lastRent.amount"] = money(-rent.amountPence);
  const pension = newestFirst.find((transaction) => transaction.description === "Pension payment");
  if (pension) facts["bank.lastPension.amount"] = money(pension.amountPence);

  if (energy?.bills[0]) {
    const billPence = energy.bills[0].amountPence;
    facts["bank.canPayBill"] = bool(bank.balancePence >= billPence);
    facts["bank.balanceAfterBill"] = money(bank.balancePence - billPence);
  }

  if (since) {
    facts["bank.since.energyTransfers"] = num(
      energyPayments.filter((transaction) => transaction.type === "Bank transfer" && transaction.postedAt >= since).length,
    );
  }
}

/**
 * Everything exercises can ask about. `since` is when the current exercise started,
 * so actions such as "pay the bill" only count if they happened during the exercise.
 */
export function buildFacts(world: LearnerWorld, since: string | null = null): Facts {
  const { bank, energy } = world;
  const facts: Facts = {
    "person.firstName": text(bank.fullName.split(" ")[0]),
    "person.fullName": text(bank.fullName),
    "person.addressLine1": text(bank.addressLine1),
    "person.town": text(bank.townOrCity),
    "person.postcode": text(bank.postcode),
    "company.phone": text(WESTFORD.phone),
    "company.payLine": text(WESTFORD.payLine),
    "company.supportPhone": text(WESTFORD.supportPhone),
    "company.email": text(WESTFORD.email),
    "company.postcode": text(WESTFORD.postcode),
    "company.sortCode": text(WESTFORD.bankDetails.sortCode),
    "company.accountNumber": text(WESTFORD.bankDetails.accountNumber),
    "company.powerCutNumber": text(WESTFORD.powerCutNumber),
  };
  if (energy) energyFacts(facts, energy, since);
  bankFacts(facts, bank, energy, world.now, since);
  return facts;
}
