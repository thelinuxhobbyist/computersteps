import test from "node:test";
import assert from "node:assert/strict";

import {
  buildStatements,
  filterTransactions,
  formatMoney,
  formatSignedMoney,
  groupByDay,
  maskCardNumber,
  periodDescription,
  statementFileName,
  totals,
  withRunningBalance,
  type BankTransaction,
} from "./bank-data";
import { buildStatementPdf } from "./statement-pdf";

let nextId = 1;
const tx = (postedAt: string, description: string, amountPence: number, reference: string | null = null): BankTransaction => ({
  id: nextId++,
  postedAt,
  description,
  type: amountPence > 0 ? "Payment in" : "Card payment",
  category: "Test",
  amountPence,
  reference,
});

const account = {
  username: "JohnSmith",
  fullName: "Alex Morgan",
  addressLine1: "14 Willow Lane",
  townOrCity: "Townsville",
  postcode: "PB4 7XY",
  sortCode: "00-12-34",
  accountNumber: "12345678",
  openingBalancePence: 10000,
  transactions: [
    tx("2026-04-01T06:00:00Z", "Pension payment", 72000),
    tx("2026-04-11T12:00:00Z", "Corner Grocer", -3500),
    tx("2026-08-31T23:30:00Z", "Hillside Café", -500),
    tx("2026-09-01T06:00:00Z", "Pension payment", 72000),
    tx("2026-09-15T08:00:00Z", "Clearwater Water", -3000),
    tx("2026-10-01T06:00:00Z", "Pension payment", 72000),
    tx("2026-10-02T15:00:00Z", "Practice Shop", -2450, "PS-123456"),
  ],
};

const now = new Date("2026-10-02T16:00:00Z");

test("formats money with a pound sign, commas and a sign", () => {
  assert.equal(formatMoney(47550), "£475.50");
  assert.equal(formatMoney(123456), "£1,234.56");
  assert.equal(formatMoney(-2450), "-£24.50");
  assert.equal(formatSignedMoney(72000), "+£720.00");
  assert.equal(formatSignedMoney(-2450), "-£24.50");
});

test("only the last 4 digits of a hidden card number show", () => {
  assert.equal(maskCardNumber("4196071469011277"), "•••• •••• •••• 1277");
});

test("running balance adds each transaction in date order", () => {
  const rows = withRunningBalance(account);
  assert.equal(rows[0].balanceAfterPence, 82000);
  assert.equal(rows[rows.length - 1].balanceAfterPence, 10000 + 72000 * 3 - 3500 - 500 - 3000 - 2450);
});

test("this month only shows this month's transactions", () => {
  const rows = filterTransactions(account.transactions, { period: "this-month", now });
  assert.deepEqual(rows.map((row) => row.description), ["Pension payment", "Practice Shop"]);
});

test("months follow UK time, so 11:30pm on 31 August BST counts as September", () => {
  const rows = filterTransactions(account.transactions, { period: "last-month", now });
  assert.deepEqual(rows.map((row) => row.description), ["Hillside Café", "Pension payment", "Clearwater Water"]);
});

test("last 6 months goes back to the start of April", () => {
  assert.equal(filterTransactions(account.transactions, { period: "last-6-months", now }).length, 7);
  assert.equal(filterTransactions(account.transactions, { period: "last-3-months", now }).length, 5);
  assert.equal(periodDescription("last-6-months", now), "1 April 2026 to today");
  assert.equal(periodDescription("last-month", now), "1 September 2026 to the end of September");
});

test("search matches names, references and amounts", () => {
  const search = (query: string) => filterTransactions(account.transactions, { period: "last-6-months", query, now }).map((row) => row.description);
  assert.deepEqual(search("practice shop"), ["Practice Shop"]);
  assert.deepEqual(search("PS-123456"), ["Practice Shop"]);
  assert.deepEqual(search("£24.50"), ["Practice Shop"]);
  assert.deepEqual(search("cafe"), []);
  assert.deepEqual(search("café"), ["Hillside Café"]);
});

test("totals split money in and money out", () => {
  assert.deepEqual(totals(filterTransactions(account.transactions, { period: "this-month", now })), { inPence: 72000, outPence: 2450 });
});

test("transactions are grouped by UK day", () => {
  const groups = groupByDay(account.transactions);
  assert.equal(groups.length, 6);
  assert.equal(groups[2].label, "Tuesday 1 September 2026");
  assert.deepEqual(groups[2].transactions.map((row) => row.description), ["Hillside Café", "Pension payment"]);
});

test("statements are newest first and their balances join up", () => {
  const statements = buildStatements(account, now);
  assert.deepEqual(statements.map((statement) => statement.title), ["October 2026 (so far)", "September 2026", "April 2026"]);
  const [october, september] = statements;
  assert.equal(october.openingBalancePence, september.closingBalancePence);
  assert.equal(september.closingBalancePence, september.openingBalancePence + september.inPence - september.outPence);
  assert.equal(statementFileName(september), "Practice-Bank-statement-September-2026.pdf");
});

test("statement PDF is a valid single-byte PDF with a correct cross-reference table", () => {
  const [statement] = buildStatements(account, now);
  const bytes = buildStatementPdf(account, statement);
  const text = String.fromCharCode(...bytes);
  assert.ok(text.startsWith("%PDF-1.4"));
  assert.ok(text.trimEnd().endsWith("%%EOF"));
  assert.ok(text.includes("(Practice Shop \\(PS-123456\\)) Tj"));
  assert.ok(text.includes("(Address: 14 Willow Lane, Townsville, PB4 7XY) Tj"));
  assert.ok(text.includes("(\xA32,165.50) Tj"), "pound sign is encoded as a single byte");

  const startXref = Number(text.match(/startxref\n(\d+)/)?.[1]);
  assert.ok(text.slice(startXref).startsWith("xref"));
  const offsets = [...text.slice(startXref).matchAll(/^(\d{10}) 00000 n $/gm)].map((match) => Number(match[1]));
  offsets.forEach((offset, index) => assert.ok(text.slice(offset).startsWith(`${index + 1} 0 obj`), `object ${index + 1} offset is wrong`));
});

test("long statements spill onto more pages", () => {
  const many = Array.from({ length: 120 }, (_, index) => tx(`2026-09-${String((index % 28) + 1).padStart(2, "0")}T10:00:00Z`, "Corner Grocer", -100));
  const [statement] = buildStatements({ openingBalancePence: 50000, transactions: many }, now);
  const text = String.fromCharCode(...buildStatementPdf(account, statement));
  assert.match(text, /\/Count [3-9]/);
});
