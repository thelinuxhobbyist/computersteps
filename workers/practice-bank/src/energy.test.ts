import test from "node:test";
import assert from "node:assert/strict";

import {
  addDays,
  bankTransactionFor,
  billStatuses,
  buildEnergyHistory,
  checkDirectDebit,
  checkMessage,
  checkMeterReading,
  checkTransfer,
  makeDay,
} from "./energy";
import { WESTFORD } from "./shared/westford";

const seeded = (seed = 42) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
};

test("makeDay handles months that overflow into another year", () => {
  assert.equal(makeDay(2026, 0, 1), "2025-12-01");
  assert.equal(makeDay(2026, 13, 1), "2027-01-01");
  assert.equal(addDays("2026-02-27", 2), "2026-03-01");
});

test("the latest bill is always £84.50 and the previous £62.00, whatever the month", () => {
  for (const today of ["2026-10-07", "2026-03-01", "2026-03-31", "2027-01-15", "2028-03-10"]) {
    const { bills } = buildEnergyHistory(today, seeded());
    assert.equal(bills.length, 6);
    assert.equal(bills[5].amountPence, 8450, today);
    assert.equal(bills[4].amountPence, 6200, today);
    for (const bill of bills) {
      assert.equal(bill.amountPence, bill.kwh * bill.unitRatePence + bill.days * bill.standingChargePence);
      assert.equal(bill.closingReading - bill.openingReading, bill.kwh);
    }
  }
});

test("the example dates from the brief: an account opened on 3 October has a bill due 15 October", () => {
  const { bills } = buildEnergyHistory("2026-10-03", seeded());
  const latest = bills[5];
  assert.equal(latest.periodStart, "2026-09-01");
  assert.equal(latest.periodEnd, "2026-09-30");
  assert.equal(latest.issuedOn, "2026-10-01");
  assert.equal(latest.dueOn, "2026-10-15");
  assert.equal(latest.readingType, "estimated");
});

test("bills follow each other with no gaps and readings carry on", () => {
  const { bills } = buildEnergyHistory("2026-10-07", seeded());
  for (let index = 1; index < bills.length; index += 1) {
    assert.equal(bills[index].periodStart, addDays(bills[index - 1].periodEnd, 1));
    assert.equal(bills[index].openingReading, bills[index - 1].closingReading);
  }
});

test("every bill but the latest was paid before it was due, and before today", () => {
  const today = "2026-10-07";
  const history = buildEnergyHistory(today, seeded());
  const statuses = billStatuses(history.bills, history.payments, today);
  assert.deepEqual(
    statuses.map((bill) => bill.status),
    ["paid", "paid", "paid", "paid", "paid", "unpaid"],
  );
  for (const bill of statuses.slice(0, 5)) assert.ok(bill.paidOn && bill.paidOn < bill.dueOn && bill.paidOn <= today);
  assert.equal(statuses[5].overdue, false);
  assert.equal(new Set(history.payments.map((payment) => payment.method)).size, 3);
});

test("payments pay the oldest bill first, and part payments are shown", () => {
  const bills = [
    { periodStart: "2026-08-01", dueOn: "2026-09-15", amountPence: 6200 },
    { periodStart: "2026-09-01", dueOn: "2026-10-15", amountPence: 8450 },
  ];
  const statuses = billStatuses(bills, [{ paidAt: "2026-09-10T10:00:00Z", amountPence: 8200 }], "2026-10-20");
  assert.equal(statuses[0].status, "paid");
  assert.equal(statuses[1].status, "part-paid");
  assert.equal(statuses[1].paidPence, 2000);
  assert.equal(statuses[1].overdue, true);
});

test("energy payments appear in the bank as money going out", () => {
  const transaction = bankTransactionFor({ paidAt: "2026-10-01T10:00:00Z", amountPence: 8450, method: "bank_transfer", reference: "WP1234567" });
  assert.equal(transaction.description, WESTFORD.name);
  assert.equal(transaction.type, "Bank transfer");
  assert.equal(transaction.amountPence, -8450);
});

const owner = { fullName: "Alex Morgan", addressLine1: "14 Willow Lane", townOrCity: "Townsville", postcode: "PB3 7AB" };
const bank = { sortCode: "00-12-34", accountNumber: "12345678" };

test("a Direct Debit must use the learner's own bank details", () => {
  const good = checkDirectDebit({ accountName: "alex morgan", sortCode: "001234", accountNumber: "1234 5678", day: 20, confirm: true }, owner, bank);
  assert.ok("request" in good);
  assert.equal(good.request.day, 20);

  const wrong = checkDirectDebit({ accountName: "Sam Price", sortCode: "00-99-99", accountNumber: "12345678", day: 31, confirm: false }, owner, bank);
  assert.ok("errors" in wrong);
  assert.deepEqual(Object.keys(wrong.errors).sort(), ["accountName", "accountNumber", "confirm", "day"]);
});

test("meter readings must not go backwards or jump wildly", () => {
  assert.deepEqual(checkMeterReading({ reading: "41562" }, 41321), { reading: 41562 });
  assert.ok("errors" in checkMeterReading({ reading: "41000" }, 41321));
  assert.ok("errors" in checkMeterReading({ reading: "99999" }, 41321));
  assert.ok("errors" in checkMeterReading({ reading: "4a1" }, 41321));
});

test("messages need a topic and a few words", () => {
  assert.ok("errors" in checkMessage({ topic: "billing", message: "hi" }));
  assert.ok("errors" in checkMessage({ topic: "nonsense", message: "I need help with my bill please" }));
  assert.deepEqual(checkMessage({ topic: "struggling_to_pay", message: "I cannot pay the full bill" }), {
    topic: "struggling_to_pay",
    message: "I cannot pay the full bill",
  });
});

test("bank transfers to Westford Energy need its details and the energy account number as reference", () => {
  const transfer = {
    payeeName: "Westford Energy",
    sortCode: WESTFORD.bankDetails.sortCode,
    accountNumber: WESTFORD.bankDetails.accountNumber,
    reference: "we 1234 5678",
    amountPence: 8450,
  };
  assert.deepEqual(checkTransfer(transfer, "WE12345678"), { request: { amountPence: 8450, reference: "WE12345678" } });

  const wrongReference = checkTransfer({ ...transfer, reference: "WB123456" }, "WE12345678");
  assert.ok("errors" in wrongReference && wrongReference.errors.reference);

  const unknownAccount = checkTransfer({ ...transfer, accountNumber: "11112222" }, "WE12345678");
  assert.ok("errors" in unknownAccount && unknownAccount.errors.accountNumber);

  const wrongName = checkTransfer({ ...transfer, payeeName: "Brightspark" }, "WE12345678");
  assert.ok("errors" in wrongName && wrongName.errors.payeeName);
});
