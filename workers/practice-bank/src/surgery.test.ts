import test from "node:test";
import assert from "node:assert/strict";

import { checkDeliveryDetails, makeIdentity } from "./bank";
import { MEDICINES, getMedicine, lastMonthsOrderDate, makeNhsNumber, orderItems, pickRepeatMedicines, readOrder } from "./surgery";

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

test("made-up identities use a fictional town and postcode area", () => {
  for (let seed = 1; seed < 100; seed += 1) {
    const identity = makeIdentity(seeded(seed));
    assert.match(identity.fullName, /^[A-Z][a-z]+ [A-Z][a-z]+$/);
    assert.match(identity.addressLine1, /^\d{1,2} [A-Z]/);
    assert.equal(identity.townOrCity, "Townsville");
    assert.match(identity.postcode, /^PB\d \d[A-Z]{2}$/);
  }
});

const holder = { fullName: "Alex Morgan", addressLine1: "14 Willow Lane", townOrCity: "Townsville", postcode: "PB4 7XY" };

test("delivery details match ignoring capitals, spaces and punctuation", () => {
  assert.deepEqual(checkDeliveryDetails(holder, { fullName: "alex  morgan", addressLine1: "14 Willow Lane,", townOrCity: "TOWNSVILLE", postcode: "pb47xy" }), {});
});

test("wrong delivery details are reported field by field", () => {
  const errors = checkDeliveryDetails(holder, { fullName: "John Smith", addressLine1: "1 High Street", townOrCity: "London", postcode: "AB1 2CD" });
  assert.deepEqual(Object.keys(errors).sort(), ["addressLine1", "fullName", "postcode", "townOrCity"]);
});

test("NHS numbers use the 999 test range", () => {
  assert.match(makeNhsNumber(seeded(4)), /^999 \d{3} \d{4}$/);
});

test("each patient gets 2 to 4 medicines, never two that do the same job", () => {
  const seen = new Set<string>();
  for (let seed = 1; seed < 300; seed += 1) {
    const ids = pickRepeatMedicines(seeded(seed));
    assert.ok(ids.length >= 2 && ids.length <= 4, `${ids.length} medicines`);
    const groups = ids.map((id) => getMedicine(id)?.group);
    assert.equal(new Set(groups).size, groups.length);
    seen.add(ids.join(","));
  }
  assert.ok(seen.size > 100, "patients should get different medicines");
});

test("last month's order is about four weeks ago", () => {
  const now = new Date("2026-10-02T12:00:00Z");
  const days = (now.getTime() - lastMonthsOrderDate(now, seeded(9)).getTime()) / (24 * 60 * 60 * 1000);
  assert.ok(days > 25 && days < 32);
});

test("a repeat order only keeps medicines on the patient's own list", () => {
  const result = readOrder({ kind: "repeat", medicineIds: ["metformin", "amlodipine", "not-real"] }, ["amlodipine", "salbutamol"]);
  assert.deepEqual(result, { order: { kind: "repeat", medicineIds: ["amlodipine"], message: "" } });
  assert.deepEqual(readOrder({ kind: "repeat", medicineIds: ["metformin"] }, ["amlodipine"]), { errors: { medicineIds: "Tick at least one medicine." } });
});

test("a repeat order can carry a message for the surgery", () => {
  const result = readOrder({ kind: "repeat", medicineIds: ["amlodipine"], message: "  I am on holiday next month.  " }, ["amlodipine"]);
  assert.deepEqual(result, { order: { kind: "repeat", medicineIds: ["amlodipine"], message: "I am on holiday next month." } });
});

test("a one-off order needs the medicine name and a reason", () => {
  const result = readOrder({ kind: "other", medicineName: " ", reason: "" }, []);
  assert.ok("errors" in result && result.errors.medicineName && result.errors.reason);
  assert.deepEqual(orderItems({ kind: "other", medicineName: "Hydrocortisone cream", reason: "Doctor said" }), ["Hydrocortisone cream"]);
});

test("medicine ids are unique", () => {
  assert.equal(new Set(MEDICINES.map((medicine) => medicine.id)).size, MEDICINES.length);
});
