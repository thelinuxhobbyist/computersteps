// Shared by the Worker and the website, so exercise answers always match what the website shows.
// Phone numbers use Ofcom's reserved drama ranges and "WE" is not a real UK postcode area.

export const WESTFORD = {
  name: "Westford Energy",
  legalName: "Westford Energy Ltd",
  phone: "0306 999 0247",
  payLine: "0306 999 0251",
  supportPhone: "0808 157 0318",
  email: "help@westfordenergy.practice",
  addressLines: ["Westford Energy", "PO Box 4127", "Westford", "WE1 4EN"],
  postcode: "WE1 4EN",
  bankDetails: { payeeName: "Westford Energy Ltd", sortCode: "00-72-15", accountNumber: "40188264" },
  tariff: { name: "Westford Standard", unitRatePence: 25, standingChargePence: 50 },
  powerCutNumber: "105",
  gasEmergencyNumber: "0800 111 999",
  scamReportEmail: "report@phishing.gov.uk",
  billDueDays: 14,
} as const;

export const OPENING_HOURS = [
  { day: "Monday to Friday", hours: "8am to 8pm" },
  { day: "Saturday", hours: "9am to 1pm" },
  { day: "Sunday and bank holidays", hours: "Closed" },
] as const;

export const SUPPORT_HOURS = [
  { day: "Monday to Friday", hours: "9am to 5pm" },
  { day: "Saturday and Sunday", hours: "Closed" },
] as const;

export type EnergyPaymentMethod = "card_online" | "card_phone" | "bank_transfer" | "direct_debit";

export const PAYMENT_METHOD_LABELS: Record<EnergyPaymentMethod, string> = {
  card_online: "Online (debit card)",
  card_phone: "By phone (debit card)",
  bank_transfer: "Bank transfer",
  direct_debit: "Direct Debit",
};

export const CONTACT_TOPICS = [
  { id: "billing", label: "A question about my bill" },
  { id: "struggling_to_pay", label: "I'm finding it hard to pay" },
  { id: "payments", label: "Payments and Direct Debit" },
  { id: "meter", label: "Meter readings" },
  { id: "moving_home", label: "Moving home" },
  { id: "complaint", label: "Make a complaint" },
  { id: "other", label: "Something else" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["id"];

/** Topics that mean the learner has asked about the unpaid bill shown on the account. */
export const BILL_ENQUIRY_TOPICS: readonly ContactTopic[] = ["billing", "struggling_to_pay", "payments"];

export function contactTopicLabel(id: string): string {
  return CONTACT_TOPICS.find((topic) => topic.id === id)?.label ?? "Something else";
}

export const DIRECT_DEBIT_FIRST_DAY = 1;
export const DIRECT_DEBIT_LAST_DAY = 28;
