export type OrderType = "repeat" | "other";

export const ORDER_TYPES: { id: OrderType; label: string; hint: string }[] = [
  { id: "repeat", label: "Order a repeat prescription", hint: "For medicine you take all the time." },
  { id: "other", label: "Order a prescription", hint: "For medicine that is not on your repeat list. A doctor checks it first." },
];

export type RepeatMedicine = { id: string; name: string; instructions: string };

export const REPEAT_MEDICINES: RepeatMedicine[] = [
  { id: "amlodipine", name: "Amlodipine 5mg tablets", instructions: "For blood pressure. Take 1 a day." },
  { id: "salbutamol", name: "Salbutamol inhaler", instructions: "For asthma. 2 puffs when needed." },
  { id: "omeprazole", name: "Omeprazole 20mg capsules", instructions: "For indigestion. Take 1 each morning." },
];

export const PRACTICE_PHARMACY = { name: "Millbrook Pharmacy", address: "3 High Street, Millbrook" } as const;

export type PrescriptionAnswers = {
  medicineIds: string[];
  medicineName: string;
  reason: string;
};

export const EMPTY_PRESCRIPTION: PrescriptionAnswers = { medicineIds: [], medicineName: "", reason: "" };

export type PrescriptionErrors = Partial<Record<keyof PrescriptionAnswers, string>>;

export function validateMedicines(type: OrderType, answers: PrescriptionAnswers): PrescriptionErrors {
  const errors: PrescriptionErrors = {};
  if (type === "repeat") {
    if (!answers.medicineIds.some((id) => REPEAT_MEDICINES.some((medicine) => medicine.id === id))) {
      errors.medicineIds = "Tick at least one medicine.";
    }
  } else {
    if (!answers.medicineName.trim()) errors.medicineName = "Type the name of the medicine.";
    if (!answers.reason.trim()) errors.reason = "Tell us why you need it.";
  }
  return errors;
}

export function orderedMedicineNames(type: OrderType, answers: PrescriptionAnswers): string[] {
  if (type === "other") return [answers.medicineName.trim()];
  return REPEAT_MEDICINES.filter((medicine) => answers.medicineIds.includes(medicine.id)).map((medicine) => medicine.name);
}

export function makePrescriptionReference(random = Math.random): string {
  return `RX-${Math.floor(100000 + random() * 900000)}`;
}

export type PrescriptionSituation = { id: string; title: string; situation: string };

export const PRESCRIPTION_SITUATIONS: PrescriptionSituation[] = [
  {
    id: "blood-pressure",
    title: "Blood pressure tablets",
    situation: "You only have one week of blood pressure tablets left. Order some more.",
  },
  {
    id: "inhaler-and-capsules",
    title: "Inhaler and capsules",
    situation: "Your inhaler is nearly empty, and you need more indigestion capsules. Order both at the same time.",
  },
  {
    id: "eczema-cream",
    title: "Cream from the doctor",
    situation:
      "At your appointment, the doctor said you could have hydrocortisone cream for your eczema. It is not on your repeat list. Order it.",
  },
];
