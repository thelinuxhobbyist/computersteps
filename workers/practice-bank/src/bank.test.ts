import test from "node:test";
import assert from "node:assert/strict";

import {
  STARTING_BALANCE_PENCE,
  buildStarterHistory,
  checkCardDetails,
  cleanReference,
  lowestRunningBalance,
  makeCard,
  makeCardNumber,
  passesLuhn,
  readAmount,
  validateUsername,
} from "./bank";

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

test("accepts simple usernames and explains bad ones", () => {
  assert.deepEqual(validateUsername(" JohnSmith "), { username: "JohnSmith" });
  assert.deepEqual(validateUsername("Mary72"), { username: "Mary72" });
  assert.match((validateUsername("John Smith") as { error: string }).error, /spaces/);
  assert.ok("error" in validateUsername("Jo"));
  assert.ok("error" in validateUsername("john@example.com"));
  assert.ok("error" in validateUsername(""));
  assert.ok("error" in validateUsername(42));
});

test("Luhn check works on a known valid number", () => {
  assert.equal(passesLuhn("4532015112830366"), true);
  assert.equal(passesLuhn("4532015112830367"), false);
});

test("card numbers are 16 digits and can never be a real card", () => {
  for (let seed = 1; seed < 500; seed += 1) {
    const number = makeCardNumber(seeded(seed));
    assert.match(number, /^4\d{15}$/);
    assert.equal(passesLuhn(number), false);
  }
});

test("a new card expires in 4 years and shows the account holder's name", () => {
  const card = makeCard("Alex Morgan", new Date("2026-10-02T12:00:00Z"), seeded(7));
  assert.equal(card.nameOnCard, "ALEX MORGAN");
  assert.equal(card.expiry, "10/30");
  assert.match(card.cvv, /^\d{3}$/);
  assert.match(card.sortCode, /^00-\d{2}-\d{2}$/);
  assert.match(card.accountNumber, /^\d{8}$/);
});

test("starter history ends at the starting balance and is never overdrawn", () => {
  const dates = ["2026-10-01T05:00:00Z", "2026-10-01T09:00:00Z", "2026-10-02T12:00:00Z", "2026-03-31T23:00:00Z", "2027-02-28T12:00:00Z"];
  for (const date of dates) {
    for (let seed = 1; seed < 200; seed += 1) {
      const now = new Date(date);
      const { openingBalancePence, transactions } = buildStarterHistory(now, seeded(seed));
      const total = transactions.reduce((sum, transaction) => sum + transaction.amountPence, openingBalancePence);
      assert.equal(total, STARTING_BALANCE_PENCE);
      assert.ok(transactions.length > 80, `only ${transactions.length} transactions`);
      assert.ok(lowestRunningBalance(openingBalancePence, transactions) >= 0, `overdrawn for ${date} seed ${seed}`);
      assert.ok(transactions.every((transaction) => new Date(transaction.postedAt) <= now), "history is in the future");
    }
  }
});

test("starter history covers the last 6 months in date order", () => {
  const { transactions } = buildStarterHistory(new Date("2026-10-02T12:00:00Z"), seeded(3));
  assert.ok(transactions[0].postedAt.startsWith("2026-04-01"));
  const sorted = [...transactions].sort((a, b) => a.postedAt.localeCompare(b.postedAt));
  assert.deepEqual(transactions, sorted);
});

const card = { nameOnCard: "JOHNSMITH", cardNumber: "4000123412341234", expiry: "10/30", cvv: "123" };

test("card details match ignoring case, spaces and the expiry slash", () => {
  assert.deepEqual(checkCardDetails(card, { nameOnCard: "John Smith", cardNumber: "4000 1234 1234 1234", expiry: "1030", cvv: "123" }), {});
});

test("wrong card details are reported field by field", () => {
  const errors = checkCardDetails(card, { nameOnCard: "JANE SMITH", cardNumber: card.cardNumber, expiry: "10/31", cvv: "321" });
  assert.deepEqual(Object.keys(errors).sort(), ["cvv", "expiry", "nameOnCard"]);
});

test("payment amounts must be whole pence and sensible", () => {
  assert.equal(readAmount(2450), 2450);
  assert.equal(readAmount(0), null);
  assert.equal(readAmount(-100), null);
  assert.equal(readAmount(12.5), null);
  assert.equal(readAmount("2450"), null);
  assert.equal(readAmount(10_000_000), null);
});

test("order references are cleaned", () => {
  assert.equal(cleanReference("PS-123456"), "PS-123456");
  assert.equal(cleanReference("<b>PS</b>"), "bPSb");
  assert.equal(cleanReference(""), null);
  assert.equal(cleanReference(5), null);
});
