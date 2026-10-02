export type OrderType = "repeat" | "other";

export const ORDER_TYPES: { id: OrderType; label: string; hint: string }[] = [
  { id: "repeat", label: "Order a repeat prescription", hint: "For medicine you take all the time." },
  { id: "other", label: "Order a prescription", hint: "For medicine that is not on your repeat list. A doctor checks it first." },
];

export type RepeatMedicine = { id: string; name: string; instructions: string };

export type PastOrder = {
  id: number;
  placedAt: string;
  reference: string;
  kind: OrderType;
  items: string[];
  reason: string | null;
  message: string | null;
  status: string;
};

/** A pretend patient, stored by the practice Worker so the learner can come back to it. */
export type Patient = {
  username: string;
  fullName: string;
  addressLine1: string;
  townOrCity: string;
  postcode: string;
  nhsNumber: string;
  repeatMedicines: RepeatMedicine[];
  /** Newest first. */
  orders: PastOrder[];
};

export const PRACTICE_PHARMACY = { name: "Millbrook Pharmacy", address: "3 High Street, Millbrook" } as const;

export type PrescriptionAnswers = {
  medicineIds: string[];
  medicineName: string;
  reason: string;
  /** Optional note sent with a repeat order. */
  message: string;
};

export const EMPTY_PRESCRIPTION: PrescriptionAnswers = { medicineIds: [], medicineName: "", reason: "", message: "" };

export type PrescriptionErrors = Partial<Record<Exclude<keyof PrescriptionAnswers, "message">, string>>;

export function validateMedicines(type: OrderType, answers: PrescriptionAnswers, repeatMedicines: RepeatMedicine[]): PrescriptionErrors {
  const errors: PrescriptionErrors = {};
  if (type === "repeat") {
    if (!answers.medicineIds.some((id) => repeatMedicines.some((medicine) => medicine.id === id))) {
      errors.medicineIds = "Tick at least one medicine.";
    }
  } else {
    if (!answers.medicineName.trim()) errors.medicineName = "Type the name of the medicine.";
    if (!answers.reason.trim()) errors.reason = "Tell us why you need it.";
  }
  return errors;
}

export function orderedMedicineNames(type: OrderType, answers: PrescriptionAnswers, repeatMedicines: RepeatMedicine[]): string[] {
  if (type === "other") return [answers.medicineName.trim()];
  return repeatMedicines.filter((medicine) => answers.medicineIds.includes(medicine.id)).map((medicine) => medicine.name);
}

export function lastRepeatOrder(orders: PastOrder[]): PastOrder | undefined {
  return orders.find((order) => order.kind === "repeat");
}

const dateParts = (iso: string) =>
  Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "long", day: "numeric", month: "long", year: "numeric" })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );

export function formatOrderDate(iso: string): string {
  const parts = dateParts(iso);
  return `${parts.weekday} ${parts.day} ${parts.month} ${parts.year}`;
}

export type PrescriptionTask = { id: string; title: string; situation: string };

/** Practice situations written around the patient's own medicines. */
export function prescriptionTasks(patient: Pick<Patient, "repeatMedicines">): PrescriptionTask[] {
  const [first] = patient.repeatMedicines;
  return [
    {
      id: "same-again",
      title: "Same as last month",
      situation: "You are running low on all your medicines. Order everything on your last prescription.",
    },
    ...(first
      ? [
          {
            id: "just-one",
            title: "Just one medicine",
            situation: `You still have plenty of your other medicines, but only one week of ${first.name} left. Order just that one.`,
          },
        ]
      : []),
    {
      id: "history",
      title: "Check your last order",
      situation: "Find the date you last ordered your medicine, and check whether it was collected.",
    },
    {
      id: "holiday",
      title: "Going on holiday",
      situation:
        "You are going on holiday next month. Order your repeat medicines, and add a message asking for next month's medicine too.",
    },
    {
      id: "nhs-number",
      title: "Find your NHS number",
      situation: "The pharmacist asks for your NHS number. Find it on this page.",
    },
    {
      id: "eczema-cream",
      title: "Cream from the doctor",
      situation:
        "At your appointment, the doctor said you could have hydrocortisone cream for your eczema. It is not on your repeat list. Order it.",
    },
  ];
}
