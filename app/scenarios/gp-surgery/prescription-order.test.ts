import test from "node:test";
import assert from "node:assert/strict";

import {
  EMPTY_PRESCRIPTION,
  formatOrderDate,
  lastRepeatOrder,
  orderedMedicineNames,
  prescriptionTasks,
  validateMedicines,
  type PastOrder,
  type RepeatMedicine,
} from "./prescription-order";

const MEDICINES: RepeatMedicine[] = [
  { id: "salbutamol", name: "Salbutamol inhaler", instructions: "For asthma." },
  { id: "omeprazole", name: "Omeprazole 20mg capsules", instructions: "For indigestion." },
];

test("a repeat order needs at least one of the patient's medicines ticked", () => {
  assert.deepEqual(Object.keys(validateMedicines("repeat", EMPTY_PRESCRIPTION, MEDICINES)), ["medicineIds"]);
  assert.deepEqual(validateMedicines("repeat", { ...EMPTY_PRESCRIPTION, medicineIds: ["salbutamol"] }, MEDICINES), {});
});

test("a repeat order ignores medicines that are not on this patient's list", () => {
  assert.ok(validateMedicines("repeat", { ...EMPTY_PRESCRIPTION, medicineIds: ["amlodipine"] }, MEDICINES).medicineIds);
});

test("a prescription order needs the medicine name and the reason", () => {
  assert.deepEqual(Object.keys(validateMedicines("other", EMPTY_PRESCRIPTION, MEDICINES)).sort(), ["medicineName", "reason"]);
  const answers = { ...EMPTY_PRESCRIPTION, medicineName: "Hydrocortisone cream", reason: "The doctor said I could have it" };
  assert.deepEqual(validateMedicines("other", answers, MEDICINES), {});
});

test("lists the ordered medicines in repeat-list order", () => {
  const names = orderedMedicineNames("repeat", { ...EMPTY_PRESCRIPTION, medicineIds: ["omeprazole", "salbutamol"] }, MEDICINES);
  assert.deepEqual(names, ["Salbutamol inhaler", "Omeprazole 20mg capsules"]);
  assert.deepEqual(orderedMedicineNames("other", { ...EMPTY_PRESCRIPTION, medicineName: "  Hydrocortisone cream " }, MEDICINES), [
    "Hydrocortisone cream",
  ]);
});

test("the last prescription is the newest repeat order", () => {
  const order = (id: number, kind: PastOrder["kind"]): PastOrder => ({
    id,
    kind,
    placedAt: "2026-09-04T10:00:00Z",
    reference: `RX-10000${id}`,
    items: [],
    reason: null,
    message: null,
    status: "Collected",
  });
  assert.equal(lastRepeatOrder([order(3, "other"), order(2, "repeat"), order(1, "repeat")])?.id, 2);
  assert.equal(lastRepeatOrder([order(1, "other")]), undefined);
});

test("order dates are shown in UK time without commas", () => {
  assert.equal(formatOrderDate("2026-08-31T23:30:00Z"), "Tuesday 1 September 2026");
});

test("practice situations mention the patient's own medicine", () => {
  const tasks = prescriptionTasks({ repeatMedicines: MEDICINES });
  assert.ok(tasks.some((task) => task.situation.includes("Salbutamol inhaler")));
  assert.equal(new Set(tasks.map((task) => task.id)).size, tasks.length);
});
