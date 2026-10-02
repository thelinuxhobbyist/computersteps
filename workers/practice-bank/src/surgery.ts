import type { Random } from "./bank";

export type Medicine = { id: string; name: string; instructions: string; group: string };

/** Medicines in the same group do the same job, so a patient only gets one from each group. */
export const MEDICINES: Medicine[] = [
  { id: "amlodipine", name: "Amlodipine 5mg tablets", instructions: "For blood pressure. Take 1 a day.", group: "blood-pressure" },
  { id: "ramipril", name: "Ramipril 2.5mg capsules", instructions: "For blood pressure. Take 1 a day.", group: "blood-pressure" },
  { id: "atorvastatin", name: "Atorvastatin 20mg tablets", instructions: "For cholesterol. Take 1 at night.", group: "cholesterol" },
  { id: "metformin", name: "Metformin 500mg tablets", instructions: "For diabetes. Take 1 twice a day with food.", group: "diabetes" },
  { id: "salbutamol", name: "Salbutamol inhaler", instructions: "For asthma. 2 puffs when needed.", group: "reliever" },
  { id: "beclometasone", name: "Beclometasone inhaler", instructions: "For asthma. 2 puffs morning and night.", group: "preventer" },
  { id: "omeprazole", name: "Omeprazole 20mg capsules", instructions: "For indigestion. Take 1 each morning.", group: "stomach" },
  { id: "lansoprazole", name: "Lansoprazole 15mg capsules", instructions: "For indigestion. Take 1 each morning.", group: "stomach" },
  { id: "levothyroxine", name: "Levothyroxine 50mcg tablets", instructions: "For your thyroid. Take 1 each morning.", group: "thyroid" },
  { id: "furosemide", name: "Furosemide 20mg tablets", instructions: "Water tablets. Take 1 each morning.", group: "water" },
  { id: "sertraline", name: "Sertraline 50mg tablets", instructions: "For low mood. Take 1 a day.", group: "mood" },
  { id: "emollient", name: "Emollient cream (500g)", instructions: "For dry skin. Use as often as needed.", group: "skin" },
];

export const getMedicine = (id: string) => MEDICINES.find((medicine) => medicine.id === id);

export const MAX_MEDICINE_NAME = 60;
export const MAX_REASON = 300;

/** NHS numbers starting 999 are set aside for testing, so they never belong to a real person. */
export function makeNhsNumber(random: Random): string {
  const digits = Array.from({ length: 7 }, () => Math.floor(random() * 10)).join("");
  return `999 ${digits.slice(0, 3)} ${digits.slice(3)}`;
}

export function pickRepeatMedicines(random: Random): string[] {
  const count = 2 + Math.floor(random() * 3);
  const shuffled = [...MEDICINES].sort(() => random() - 0.5);
  const chosen: Medicine[] = [];
  for (const medicine of shuffled) {
    if (chosen.length === count) break;
    if (!chosen.some((other) => other.group === medicine.group)) chosen.push(medicine);
  }
  return MEDICINES.filter((medicine) => chosen.includes(medicine)).map((medicine) => medicine.id);
}

export function makePrescriptionReference(random: Random): string {
  return `RX-${100000 + Math.floor(random() * 900000)}`;
}

/** Last month's order, so the learner has something to copy. */
export function lastMonthsOrderDate(now: Date, random: Random): Date {
  const daysAgo = 26 + Math.floor(random() * 5);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  date.setUTCHours(10, Math.floor(random() * 60), 0, 0);
  return date;
}

export type OrderRequest =
  | { kind: "repeat"; medicineIds: string[]; message: string }
  | { kind: "other"; medicineName: string; reason: string };

export type OrderErrors = Partial<Record<"medicineIds" | "medicineName" | "reason", string>>;

export function readOrder(body: Record<string, unknown>, repeatIds: string[]): { order: OrderRequest } | { errors: OrderErrors } {
  if (body.kind === "repeat") {
    const ticked = Array.isArray(body.medicineIds) ? body.medicineIds.filter((id): id is string => typeof id === "string") : [];
    const medicineIds = repeatIds.filter((id) => ticked.includes(id));
    if (medicineIds.length === 0) return { errors: { medicineIds: "Tick at least one medicine." } };
    const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_REASON) : "";
    return { order: { kind: "repeat", medicineIds, message } };
  }

  const medicineName = typeof body.medicineName === "string" ? body.medicineName.trim().slice(0, MAX_MEDICINE_NAME) : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, MAX_REASON) : "";
  const errors: OrderErrors = {};
  if (!medicineName) errors.medicineName = "Type the name of the medicine.";
  if (!reason) errors.reason = "Tell us why you need it.";
  return Object.keys(errors).length > 0 ? { errors } : { order: { kind: "other", medicineName, reason } };
}

export function orderItems(order: OrderRequest): string[] {
  return order.kind === "repeat"
    ? order.medicineIds.map((id) => getMedicine(id)?.name ?? id)
    : [order.medicineName];
}
