export const STARTING_BALANCE_PENCE = 50000;
export const MAX_PAYMENT_PENCE = 100000;
export const HISTORY_MONTHS = 6;

export type Random = () => number;

export type TransactionType = "Payment in" | "Direct Debit" | "Card payment" | "Cash withdrawal";

export type NewTransaction = {
  postedAt: string;
  description: string;
  type: TransactionType;
  category: string;
  amountPence: number;
  reference: string | null;
};

export type CardDetails = {
  nameOnCard: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

export type StoredCard = {
  nameOnCard: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

export type CardErrors = Partial<Record<keyof CardDetails, string>>;

const USERNAME_PATTERN = /^[A-Za-z0-9]{3,20}$/;

export function validateUsername(raw: unknown): { username: string } | { error: string } {
  const username = typeof raw === "string" ? raw.trim() : "";
  if (!username) return { error: "Please choose a username." };
  if (/\s/.test(username)) return { error: "A username cannot have spaces. Try JohnSmith instead of John Smith." };
  if (!USERNAME_PATTERN.test(username)) {
    return { error: "Use 3 to 20 letters and numbers only, like JohnSmith or Mary72." };
  }
  return { username };
}

export function usernameKey(username: string): string {
  return username.trim().toLowerCase();
}

const randomDigits = (count: number, random: Random) =>
  Array.from({ length: count }, () => Math.floor(random() * 10)).join("");

export function passesLuhn(digits: string): boolean {
  let sum = 0;
  for (let index = 0; index < digits.length; index += 1) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

// The last digit is chosen so the number fails the Luhn check, so it can never be a real card number.
export function makeCardNumber(random: Random): string {
  const body = `4${randomDigits(14, random)}`;
  const start = Math.floor(random() * 10);
  for (let offset = 0; offset < 10; offset += 1) {
    const candidate = `${body}${(start + offset) % 10}`;
    if (!passesLuhn(candidate)) return candidate;
  }
  return `${body}0`;
}

export function makeCard(fullName: string, now: Date, random: Random): StoredCard & { sortCode: string; accountNumber: string } {
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const year = String((now.getUTCFullYear() + 4) % 100).padStart(2, "0");
  return {
    nameOnCard: fullName.toUpperCase(),
    cardNumber: makeCardNumber(random),
    expiry: `${month}/${year}`,
    cvv: randomDigits(3, random),
    sortCode: `00-${randomDigits(2, random)}-${randomDigits(2, random)}`,
    accountNumber: randomDigits(8, random),
  };
}

const between = (min: number, max: number, random: Random) => min + Math.floor(random() * (max - min + 1));
const pick = <T>(items: T[], random: Random): T => items[Math.floor(random() * items.length)];

export type Identity = {
  fullName: string;
  addressLine1: string;
  townOrCity: string;
  postcode: string;
};

const FIRST_NAMES = ["Alex", "Sam", "Jo", "Chris", "Pat", "Robin", "Jamie", "Lee", "Morgan", "Charlie", "Frankie", "Terry", "Kim", "Ali"];
const LAST_NAMES = ["Morgan", "Ellis", "Hughes", "Carter", "Bennett", "Walsh", "Turner", "Price", "Hayes", "Fletcher", "Parker", "Shaw"];
const STREETS = ["Willow Lane", "Mill Road", "Station Street", "Orchard Close", "Church Walk", "Park Avenue", "Meadow Way", "Bridge Street"];
const POSTCODE_LETTERS = "ABDEFGHJLNPQRSTUWXYZ";

/** A made-up account holder. "PB" is not a real UK postcode area and Townsville is not a real town. */
export function makeIdentity(random: Random): Identity {
  return {
    fullName: `${pick(FIRST_NAMES, random)} ${pick(LAST_NAMES, random)}`,
    addressLine1: `${between(1, 99, random)} ${pick(STREETS, random)}`,
    townOrCity: "Townsville",
    postcode: `PB${between(1, 9, random)} ${between(1, 9, random)}${pick([...POSTCODE_LETTERS], random)}${pick([...POSTCODE_LETTERS], random)}`,
  };
}

export type DeliveryErrors = Partial<Record<keyof Identity, string>>;

const squashText = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export function readDeliveryDetails(body: Record<string, unknown>): Identity {
  const text = (value: unknown) => (typeof value === "string" ? value.slice(0, 80) : "");
  return {
    fullName: text(body.fullName),
    addressLine1: text(body.addressLine1),
    townOrCity: text(body.townOrCity),
    postcode: text(body.postcode),
  };
}

/** Ignores capitals, spaces and punctuation, so "14 willow lane," matches "14 Willow Lane". */
export function checkDeliveryDetails(account: Identity, details: Identity): DeliveryErrors {
  const errors: DeliveryErrors = {};
  if (squashText(details.fullName) !== squashText(account.fullName)) {
    errors.fullName = "The name does not match your Practice Bank account. Use the name shown in Practice Bank under My card.";
  }
  if (squashText(details.addressLine1) !== squashText(account.addressLine1)) {
    errors.addressLine1 = "The address does not match your Practice Bank account. Check the house number and street.";
  }
  if (squashText(details.townOrCity) !== squashText(account.townOrCity)) {
    errors.townOrCity = "The town does not match your Practice Bank account.";
  }
  if (squashText(details.postcode) !== squashText(account.postcode)) {
    errors.postcode = "The postcode does not match your Practice Bank account.";
  }
  return errors;
}

function at(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(Date.UTC(year, month, day, hour, minute));
}

const GROCERS = ["Corner Grocer", "Fresh Fields Market"];
const SMALL_SPENDS = [
  { description: "Hillside Café", category: "Eating out", min: 350, max: 1250 },
  { description: "High Street Pharmacy", category: "Health", min: 450, max: 1500 },
  { description: "Town Buses", category: "Transport", min: 250, max: 550 },
  { description: "Page Turner Books", category: "Shopping", min: 599, max: 1299 },
];

function monthEvents(year: number, month: number, random: Random): NewTransaction[] {
  const events: Array<Omit<NewTransaction, "postedAt" | "reference"> & { when: Date }> = [
    { when: at(year, month, 1, 6), description: "Pension payment", type: "Payment in", category: "Money in", amountPence: 72000 },
    { when: at(year, month, 1, 7), description: "Oakfield Housing (rent)", type: "Direct Debit", category: "Bills", amountPence: -26000 },
    { when: at(year, month, 1, 8), description: "Townsville Council Tax", type: "Direct Debit", category: "Bills", amountPence: -9500 },
    { when: at(year, month, 2, 8), description: "Brightspark Energy", type: "Direct Debit", category: "Bills", amountPence: -6500 },
    { when: at(year, month, 15, 8), description: "Clearwater Water", type: "Direct Debit", category: "Bills", amountPence: -3000 },
    { when: at(year, month, 20, 8), description: "Chatter Mobile", type: "Direct Debit", category: "Bills", amountPence: -1200 },
    { when: at(year, month, 8, 11), description: "Cash machine, High Street", type: "Cash withdrawal", category: "Cash", amountPence: -4000 },
    { when: at(year, month, 22, 14), description: "Cash machine, High Street", type: "Cash withdrawal", category: "Cash", amountPence: -2000 },
  ];

  [4, 11, 18, 25].forEach((day, index) => {
    events.push({
      when: at(year, month, day + between(0, 1, random), between(9, 17, random), between(0, 59, random)),
      description: GROCERS[index % GROCERS.length],
      type: "Card payment",
      category: "Groceries",
      amountPence: -between(2800, 5200, random),
    });
  });

  for (let count = 0; count < 3; count += 1) {
    const spend = SMALL_SPENDS[Math.floor(random() * SMALL_SPENDS.length)];
    events.push({
      when: at(year, month, between(3, 27, random), between(10, 17, random), between(0, 59, random)),
      description: spend.description,
      type: "Card payment",
      category: spend.category,
      amountPence: -between(spend.min, spend.max, random),
    });
  }

  return events.map(({ when, ...event }) => ({ ...event, postedAt: when.toISOString(), reference: null }));
}

export function lowestRunningBalance(openingBalancePence: number, transactions: NewTransaction[]): number {
  let balance = openingBalancePence;
  let lowest = balance;
  for (const transaction of transactions) {
    balance += transaction.amountPence;
    lowest = Math.min(lowest, balance);
  }
  return lowest;
}

/**
 * Six months of everyday fictional history, ending at exactly the starting balance.
 * The opening balance is worked out backwards so the history never goes overdrawn.
 */
export function buildStarterHistory(now: Date, random: Random): { openingBalancePence: number; transactions: NewTransaction[] } {
  const nowTime = now.getTime();

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const transactions: NewTransaction[] = [];
    for (let back = HISTORY_MONTHS; back >= 0; back -= 1) {
      const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
      transactions.push(...monthEvents(first.getUTCFullYear(), first.getUTCMonth(), random));
    }

    const past = transactions
      .filter((transaction) => new Date(transaction.postedAt).getTime() <= nowTime)
      .sort((a, b) => a.postedAt.localeCompare(b.postedAt));
    const total = past.reduce((sum, transaction) => sum + transaction.amountPence, 0);
    const openingBalancePence = STARTING_BALANCE_PENCE - total;

    if (openingBalancePence >= 0 && lowestRunningBalance(openingBalancePence, past) >= 0) {
      return { openingBalancePence, transactions: past };
    }
  }

  return { openingBalancePence: STARTING_BALANCE_PENCE, transactions: [] };
}

const digitsOnly = (value: string) => value.replace(/\D/g, "");
const squashName = (value: string) => value.replace(/\s+/g, "").toUpperCase();

export function normaliseCardNumber(value: unknown): string {
  return typeof value === "string" ? digitsOnly(value) : "";
}

export function readCardDetails(body: Record<string, unknown>): CardDetails {
  const text = (value: unknown) => (typeof value === "string" ? value.slice(0, 40) : "");
  return {
    nameOnCard: text(body.nameOnCard),
    cardNumber: text(body.cardNumber),
    expiry: text(body.expiry),
    cvv: text(body.cvv),
  };
}

export function checkCardDetails(card: StoredCard, details: CardDetails): CardErrors {
  const errors: CardErrors = {};
  if (squashName(details.nameOnCard) !== squashName(card.nameOnCard)) {
    errors.nameOnCard = "The name does not match the card. Check the spelling against your card.";
  }
  if (digitsOnly(details.expiry) !== digitsOnly(card.expiry)) {
    errors.expiry = "Your expiry date is incorrect. Check the date on your card.";
  }
  if (digitsOnly(details.cvv) !== card.cvv) {
    errors.cvv = "Your security code is incorrect. It is the 3 numbers on the back of your card.";
  }
  return errors;
}

export function readAmount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value <= 0 || value > MAX_PAYMENT_PENCE) return null;
  return value;
}

export function cleanReference(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const reference = value.replace(/[^A-Za-z0-9-]/g, "").slice(0, 20);
  return reference || null;
}
