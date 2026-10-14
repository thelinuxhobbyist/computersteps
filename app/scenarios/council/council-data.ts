export const COUNCIL_BASE = "/scenarios/council";

export const COUNCIL_NAV = [
  { label: "Home", href: `${COUNCIL_BASE}/` },
  { label: "My Account", href: `${COUNCIL_BASE}/account/` },
  { label: "Council Tax", href: `${COUNCIL_BASE}/council-tax/` },
  { label: "Bins & Recycling", href: `${COUNCIL_BASE}/bins/` },
  { label: "Report a Problem", href: `${COUNCIL_BASE}/report/` },
  { label: "Housing", href: `${COUNCIL_BASE}/housing/` },
  { label: "Benefits & Support", href: `${COUNCIL_BASE}/benefits/` },
  { label: "Contact Us", href: `${COUNCIL_BASE}/contact/` },
];

export const RESIDENT = {
  fullName: "Ava Patel",
  addressLine1: "17 River Walk",
  townOrCity: "Westford",
  postcode: "WF1 3AB",
  residentNumber: "RC-28471",
  councilTaxReference: "WK-74624591",
  email: "ava.patel@example.com",
  phone: "07700 900123",
};

export const COUNCIL_STORAGE_PREFIX = "computer-steps:westford-council";

export type CouncilRequest = {
  id: string;
  kind: "contact" | "report" | "bins" | "housing" | "benefits" | "council-tax";
  topic: string;
  subject: string;
  location?: string;
  body: string;
  reference: string;
  status: string;
  submittedAt: string;
  reply?: string;
};

export function formatCouncilDate(day: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(day));
}

export function makeCouncilReference(): string {
  const now = new Date();
  const year = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Europe/London" }).format(now);
  const serial = 1000 + Math.floor(Math.random() * 9000);
  return `WC-${year}-${serial}`;
}

export function councilRequestStatus(status: string): string {
  if (status === "complete") return "Completed";
  if (status === "replied") return "Reply saved";
  if (status === "in-progress") return "In progress";
  if (status === "submitted") return "Submitted";
  return "Received";
}

export const COUNCIL_BILL = {
  reference: "WK-74624591",
  year: "2026/27",
  dueOn: "2026-11-11",
  amountPence: 186450,
  outstandingPence: 186450,
  instalments: 10,
  paymentHistory: [
    { label: "March 2026", amountPence: 18645 },
    { label: "April 2026", amountPence: 18645 },
    { label: "May 2026", amountPence: 18645 },
  ],
};

export const BIN_COLLECTIONS = {
  nextDate: "2026-10-15",
  binType: "Blue recycling bin",
  briefing: "Put out your blue recycling bin tonight. The collection team will check for cardboard, paper and plastic bottles.",
};
