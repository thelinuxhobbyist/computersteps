import test from "node:test";
import assert from "node:assert/strict";

import {
  EMPTY_PRESCRIPTION,
  makePrescriptionReference,
  orderedMedicineNames,
  validateMedicines,
} from "./prescription-order";

test("a repeat order needs at least one medicine ticked", () => {
  assert.deepEqual(Object.keys(validateMedicines("repeat", EMPTY_PRESCRIPTION)), ["medicineIds"]);
  assert.deepEqual(validateMedicines("repeat", { ...EMPTY_PRESCRIPTION, medicineIds: ["amlodipine"] }), {});
});

test("a repeat order ignores medicines that are not on the repeat list", () => {
  assert.ok(validateMedicines("repeat", { ...EMPTY_PRESCRIPTION, medicineIds: ["not-a-medicine"] }).medicineIds);
});

test("a prescription order needs the medicine name and the reason", () => {
  assert.deepEqual(Object.keys(validateMedicines("other", EMPTY_PRESCRIPTION)).sort(), ["medicineName", "reason"]);
  const answers = { ...EMPTY_PRESCRIPTION, medicineName: "Hydrocortisone cream", reason: "The doctor said I could have it" };
  assert.deepEqual(validateMedicines("other", answers), {});
});

test("lists the ordered medicines in repeat-list order", () => {
  const names = orderedMedicineNames("repeat", { ...EMPTY_PRESCRIPTION, medicineIds: ["omeprazole", "salbutamol"] });
  assert.deepEqual(names, ["Salbutamol inhaler", "Omeprazole 20mg capsules"]);
  assert.deepEqual(orderedMedicineNames("other", { ...EMPTY_PRESCRIPTION, medicineName: "  Hydrocortisone cream " }), [
    "Hydrocortisone cream",
  ]);
});

test("reference numbers look like RX-123456", () => {
  assert.equal(makePrescriptionReference(() => 0), "RX-100000");
  assert.match(makePrescriptionReference(), /^RX-\d{6}$/);
});
