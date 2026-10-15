import test from "node:test";
import assert from "node:assert/strict";

import { displayLines, fareParts, quoteTrip } from "./shared/travel.ts";

test("a one-way quote ignores a return date and does not add a return fare", () => {
  const priced = quoteTrip({
    flightId: "lon-edi-0810",
    guests: 1,
    departDate: "2026-11-02",
    returnDate: "2026-11-04",
  });
  assert.equal(priced.ok, true);
  if (!priced.ok) return;
  assert.equal(priced.quote.returnFlight, null);
  assert.equal(priced.quote.returnDate, null);
  assert.equal(priced.quote.departDate, "2026-11-02");
  assert.equal(priced.quote.totalPence, 6400);
  assert.equal(
    priced.quote.lines.some((line) => line.label.startsWith("Return")),
    false,
  );
});

test("a return quote keeps both flights, both dates and the same total", () => {
  const priced = quoteTrip({
    flightId: "lon-edi-0810",
    returnFlightId: "edi-lon-1005",
    guests: 1,
    departDate: "2026-11-02",
    returnDate: "2026-11-04",
  });
  assert.equal(priced.ok, true);
  if (!priced.ok) return;
  assert.equal(priced.quote.flight?.flightNumber, "WF1842");
  assert.equal(priced.quote.returnFlight?.flightNumber, "WF1902");
  assert.equal(priced.quote.departDate, "2026-11-02");
  assert.equal(priced.quote.returnDate, "2026-11-04");
  assert.equal(priced.quote.totalPence, 6400 + 6100);
  const parts = [fareParts(6400), fareParts(6100)];
  assert.equal(
    priced.quote.lines.reduce((sum, line) => sum + line.amountPence, 0),
    parts[0].farePence + parts[0].taxPence + parts[1].farePence + parts[1].taxPence,
  );
});

test("a return date on or before departure is rejected", () => {
  const priced = quoteTrip({
    flightId: "lon-edi-0810",
    returnFlightId: "edi-lon-1005",
    departDate: "2026-11-04",
    returnDate: "2026-11-04",
  });
  assert.equal(priced.ok, false);
});

test("fare and tax add up to the original practice price", () => {
  for (const price of [2800, 3800, 6400, 19000]) {
    const parts = fareParts(price);
    assert.equal(parts.farePence + parts.taxPence, price);
  }
});

test("older saved quotes still display a fare and tax that match the total", () => {
  const priced = quoteTrip({ flightId: "lon-edi-1840", guests: 2, departDate: "2026-11-02" });
  assert.equal(priced.ok, true);
  if (!priced.ok) return;
  const legacy = {
    ...priced.quote,
    lines: [{ label: "Flight London to Edinburgh", amountPence: priced.quote.totalPence }],
  };
  const lines = displayLines(legacy);
  assert.equal(
    lines.reduce((sum, line) => sum + line.amountPence, 0),
    legacy.totalPence,
  );
  assert.equal(lines.some((line) => line.label.includes("taxes")), true);
  assert.equal(priced.quote.totalPence, 4900);
});
