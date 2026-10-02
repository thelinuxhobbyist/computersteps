export const BANK_BASE = "/scenarios/practice-bank";
export const BANK_NAME = "Practice Bank";

export const BANK_NAV = [
  { label: "My account", href: `${BANK_BASE}/account/` },
  { label: "Transactions", href: `${BANK_BASE}/transactions/` },
  { label: "My card", href: `${BANK_BASE}/card/` },
  { label: "Statements", href: `${BANK_BASE}/statements/` },
];

export type BankTransaction = {
  id: number;
  postedAt: string;
  description: string;
  type: string;
  category: string;
  amountPence: number;
  reference: string | null;
};

/** The same rules the Worker uses for Practice Bank and Yama Clinic usernames. */
export function checkUsername(username: string): string {
  if (!username) return "Please choose a username.";
  if (/\s/.test(username)) return "A username cannot have spaces. Try JohnSmith instead of John Smith.";
  if (!/^[A-Za-z0-9]{3,20}$/.test(username)) return "Use 3 to 20 letters and numbers only, like JohnSmith or Mary72.";
  return "";
}

export type BankAccount = {
  username: string;
  fullName: string;
  addressLine1: string;
  townOrCity: string;
  postcode: string;
  nameOnCard: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  sortCode: string;
  accountNumber: string;
  openingBalancePence: number;
  balancePence: number;
  createdAt: string;
  transactions: BankTransaction[];
};

export type TransactionWithBalance = BankTransaction & { balanceAfterPence: number };

const TIME_ZONE = "Europe/London";

export function formatMoney(pence: number): string {
  const pounds = (Math.abs(pence) / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${pence < 0 ? "-" : ""}£${pounds}`;
}

export function formatSignedMoney(pence: number): string {
  return pence > 0 ? `+${formatMoney(pence)}` : formatMoney(pence);
}

export function formatCardNumber(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function maskCardNumber(digits: string): string {
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

/** For example "Friday 2 October 2026". Built from parts because browsers disagree about the comma after the day name. */
export function formatDate(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TIME_ZONE }).formatToParts(
    new Date(iso),
  );
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("weekday")} ${get("day")} ${get("month")} ${get("year")}`;
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TIME_ZONE }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE }).format(new Date(iso));
}

type DayParts = { year: number; month: number; day: number };

/** Calendar date in UK time, with month counted from 1. */
export function ukDate(iso: string | Date): DayParts {
  const parts = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "numeric", day: "numeric", timeZone: TIME_ZONE }).formatToParts(
    typeof iso === "string" ? new Date(iso) : iso,
  );
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

const monthIndex = ({ year, month }: { year: number; month: number }) => year * 12 + (month - 1);

export function monthKey(iso: string | Date): string {
  const { year, month } = ukDate(iso);
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function monthName(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 15)));
}

export function dayKey(iso: string): string {
  const { year, month, day } = ukDate(iso);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function withRunningBalance(account: Pick<BankAccount, "openingBalancePence" | "transactions">): TransactionWithBalance[] {
  let balance = account.openingBalancePence;
  return [...account.transactions]
    .sort((a, b) => a.postedAt.localeCompare(b.postedAt) || a.id - b.id)
    .map((transaction) => {
      balance += transaction.amountPence;
      return { ...transaction, balanceAfterPence: balance };
    });
}

export type PeriodId = "this-month" | "last-month" | "last-3-months" | "last-6-months";

export const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "this-month", label: "This month" },
  { id: "last-month", label: "Last month" },
  { id: "last-3-months", label: "Last 3 months" },
  { id: "last-6-months", label: "Last 6 months" },
];

/** Months are whole calendar months, so "last 6 months" means the 6 months before this one, plus this month so far. */
export function periodMonths(period: PeriodId): { from: number; to: number } {
  switch (period) {
    case "this-month":
      return { from: 0, to: 0 };
    case "last-month":
      return { from: 1, to: 1 };
    case "last-3-months":
      return { from: 3, to: 0 };
    case "last-6-months":
      return { from: 6, to: 0 };
  }
}

export function periodDescription(period: PeriodId, now: Date): string {
  const { from, to } = periodMonths(period);
  const current = monthIndex(ukDate(now));
  const keyFor = (index: number) => `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
  const start = `1 ${monthName(keyFor(current - from))}`;
  return to === 0 ? `${start} to today` : `${start} to the end of ${monthName(keyFor(current - to)).split(" ")[0]}`;
}

export function filterTransactions<T extends BankTransaction>(transactions: T[], { period, query = "", now }: { period: PeriodId; query?: string; now: Date }): T[] {
  const { from, to } = periodMonths(period);
  const current = monthIndex(ukDate(now));
  const words = query.trim().toLowerCase().replace(/£/g, "").split(/\s+/).filter(Boolean);

  return transactions.filter((transaction) => {
    const index = monthIndex(ukDate(transaction.postedAt));
    if (index < current - from || index > current - to) return false;
    if (words.length === 0) return true;
    const haystack = [
      transaction.description,
      transaction.type,
      transaction.category,
      transaction.reference ?? "",
      (Math.abs(transaction.amountPence) / 100).toFixed(2),
    ]
      .join(" ")
      .toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}

export function totals(transactions: BankTransaction[]): { inPence: number; outPence: number } {
  return transactions.reduce(
    (sum, transaction) =>
      transaction.amountPence > 0
        ? { ...sum, inPence: sum.inPence + transaction.amountPence }
        : { ...sum, outPence: sum.outPence - transaction.amountPence },
    { inPence: 0, outPence: 0 },
  );
}

export function groupByDay<T extends BankTransaction>(transactions: T[]): { day: string; label: string; transactions: T[] }[] {
  const groups: { day: string; label: string; transactions: T[] }[] = [];
  for (const transaction of transactions) {
    const day = dayKey(transaction.postedAt);
    const last = groups[groups.length - 1];
    if (last?.day === day) {
      last.transactions.push(transaction);
    } else {
      groups.push({ day, label: formatDate(transaction.postedAt), transactions: [transaction] });
    }
  }
  return groups;
}

export type Statement = {
  key: string;
  title: string;
  isCurrentMonth: boolean;
  openingBalancePence: number;
  closingBalancePence: number;
  inPence: number;
  outPence: number;
  transactions: TransactionWithBalance[];
};

export function buildStatements(account: Pick<BankAccount, "openingBalancePence" | "transactions">, now: Date): Statement[] {
  const all = withRunningBalance(account);
  const currentKey = monthKey(now);
  const keys = [...new Set(all.map((transaction) => monthKey(transaction.postedAt)))];

  return keys
    .map((key) => {
      const transactions = all.filter((transaction) => monthKey(transaction.postedAt) === key);
      const first = transactions[0];
      const openingBalancePence = first.balanceAfterPence - first.amountPence;
      const closingBalancePence = transactions[transactions.length - 1].balanceAfterPence;
      const isCurrentMonth = key === currentKey;
      return {
        key,
        title: isCurrentMonth ? `${monthName(key)} (so far)` : monthName(key),
        isCurrentMonth,
        openingBalancePence,
        closingBalancePence,
        ...totals(transactions),
        transactions,
      };
    })
    .reverse();
}

export function statementFileName(statement: Statement): string {
  return `Practice-Bank-statement-${monthName(statement.key).replace(" ", "-")}.pdf`;
}
