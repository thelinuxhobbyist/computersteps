export type ConsultationReason = "new-problem" | "existing-problem" | "medication" | "admin";

export const REASONS: { id: ConsultationReason; label: string; hint: string }[] = [
  { id: "new-problem", label: "A new medical problem", hint: "Something you have not spoken to us about before" },
  { id: "existing-problem", label: "An ongoing medical problem", hint: "Something you have already seen us about" },
  { id: "medication", label: "A question about medication", hint: "Not for ordering repeat prescriptions" },
  { id: "admin", label: "An admin request", hint: "For example a fit note, a letter or test results" },
];

export const DURATIONS = ["Today", "1 to 3 days", "4 to 7 days", "1 to 4 weeks", "More than 4 weeks"] as const;

export const HELP_OPTIONS = [
  "Advice from a doctor or nurse",
  "An appointment",
  "A prescription",
  "A fit note or letter",
  "I'm not sure",
] as const;

export const CONTACT_METHODS = [
  { id: "phone", label: "Phone call" },
  { id: "text", label: "Text message" },
  { id: "email", label: "Email" },
] as const;

export type ContactMethod = (typeof CONTACT_METHODS)[number]["id"];

export type ConsultationAnswers = {
  forWhom: "" | "me" | "someone-else";
  reason: "" | ConsultationReason;
  description: string;
  duration: string;
  isNew: "" | "yes" | "no";
  change: "" | "better" | "same" | "worse";
  helpWanted: string;
  extra: string;
  firstName: string;
  lastName: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  phone: string;
  email: string;
  contactMethod: "" | ContactMethod;
  confirmedNotUrgent: boolean;
};

export const EMPTY_ANSWERS: ConsultationAnswers = {
  forWhom: "",
  reason: "",
  description: "",
  duration: "",
  isNew: "",
  change: "",
  helpWanted: "",
  extra: "",
  firstName: "",
  lastName: "",
  dobDay: "",
  dobMonth: "",
  dobYear: "",
  phone: "",
  email: "",
  contactMethod: "",
  confirmedNotUrgent: false,
};

export type ConsultationStep = "reason" | "problem" | "details" | "check";

export const STEPS: { id: ConsultationStep; title: string }[] = [
  { id: "reason", title: "What do you need help with?" },
  { id: "problem", title: "Tell us more" },
  { id: "details", title: "Your details" },
  { id: "check", title: "Check your answers" },
];

export type ConsultationErrors = Partial<Record<keyof ConsultationAnswers | "dob", string>>;

export function isMedicalReason(reason: ConsultationAnswers["reason"]): boolean {
  return reason === "new-problem" || reason === "existing-problem";
}

export function isValidDateOfBirth(day: string, month: string, year: string, today = new Date()): boolean {
  if (![day, month, year].every((part) => /^\d+$/.test(part.trim()))) return false;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (y < 1900 || m < 1 || m > 12 || d < 1) return false;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false;
  return date <= today;
}

export function isValidUkPhone(phone: string): boolean {
  const digits = phone.replace(/[\s()-]/g, "").replace(/^\+44/, "0");
  return /^0\d{9,10}$/.test(digits);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateStep(step: ConsultationStep, answers: ConsultationAnswers): ConsultationErrors {
  const errors: ConsultationErrors = {};

  if (step === "reason") {
    if (!answers.forWhom) errors.forWhom = "Select who this request is for.";
    if (!answers.reason) errors.reason = "Select what you need help with.";
  }

  if (step === "problem") {
    if (!answers.description.trim()) {
      errors.description = "Describe what you need help with.";
    } else if (answers.description.trim().length < 10) {
      errors.description = "Tell us a little more, so we can help you.";
    }
    if (isMedicalReason(answers.reason)) {
      if (!answers.duration) errors.duration = "Select how long you have had the problem.";
      if (!answers.isNew) errors.isNew = "Select whether this is a new problem.";
      if (!answers.change) errors.change = "Select whether the problem is getting better or worse.";
    }
    if (!answers.helpWanted) errors.helpWanted = "Select what you would like us to help with.";
  }

  if (step === "details") {
    if (!answers.firstName.trim()) errors.firstName = "Enter your first name.";
    if (!answers.lastName.trim()) errors.lastName = "Enter your last name.";
    if (!answers.dobDay.trim() && !answers.dobMonth.trim() && !answers.dobYear.trim()) {
      errors.dob = "Enter your date of birth.";
    } else if (!isValidDateOfBirth(answers.dobDay, answers.dobMonth, answers.dobYear)) {
      errors.dob = "Date of birth must be a real date, for example 14 3 1985.";
    }
    if (!answers.phone.trim()) {
      errors.phone = "Enter a phone number.";
    } else if (!isValidUkPhone(answers.phone)) {
      errors.phone = "Enter a UK phone number, like 07700 900123.";
    }
    if (answers.email.trim() && !isValidEmail(answers.email)) {
      errors.email = "Enter an email address in the correct format, like name@example.com.";
    } else if (answers.contactMethod === "email" && !answers.email.trim()) {
      errors.email = "Enter an email address, or choose a different way for us to contact you.";
    }
    if (!answers.contactMethod) errors.contactMethod = "Select how you would like us to contact you.";
  }

  if (step === "check") {
    if (!answers.confirmedNotUrgent) {
      errors.confirmedNotUrgent = "Confirm that your request is not an emergency.";
    }
  }

  return errors;
}

export function makeReference(random = Math.random): string {
  return `YC-${Math.floor(100000 + random() * 900000)}`;
}

export type PracticePatient = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
};

export const PRACTICE_PATIENT: PracticePatient = {
  firstName: "Sam",
  lastName: "Taylor",
  dateOfBirth: "14 March 1985",
  phone: "07700 900123",
  email: "sam.taylor@example.com",
};

export type PracticeSituation = { id: string; title: string; situation: string };

export const PRACTICE_SITUATIONS: PracticeSituation[] = [
  {
    id: "sore-throat",
    title: "Sore throat",
    situation: "You have had a sore throat for three days. It is not getting better, and you would like advice from the surgery.",
  },
  {
    id: "back-pain",
    title: "Back pain follow-up",
    situation: "You saw a doctor about back pain two weeks ago. It is still painful, and you would like another appointment.",
  },
  {
    id: "hay-fever",
    title: "Hay fever tablets",
    situation: "Your hay fever tablets are not helping this year. You would like to ask whether you could try a different medicine.",
  },
  {
    id: "fit-note",
    title: "Fit note",
    situation: "You have been off work with a bad back for over a week. Your employer has asked you for a fit note from the surgery.",
  },
];
