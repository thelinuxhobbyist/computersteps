import { makeIdentity, type Identity, type NewTransaction } from "./bank";
import { secureRandom } from "./http";

export type AccountRow = {
  username_key: string;
  username: string;
  name_on_card: string;
  card_number: string;
  expiry: string;
  cvv: string;
  sort_code: string;
  account_number: string;
  opening_balance_pence: number;
  created_at: string;
  full_name: string;
  address_line1: string;
  town_or_city: string;
  postcode: string;
};

type TransactionRow = {
  id: number;
  posted_at: string;
  description: string;
  type: string;
  category: string;
  amount_pence: number;
  reference: string | null;
};

export type BankTransaction = {
  id: number;
  postedAt: string;
  description: string;
  type: string;
  category: string;
  amountPence: number;
  reference: string | null;
};

export type BankAccountView = Identity & {
  username: string;
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

// One statement for the whole history: the free D1 plan allows only 50 queries per request.
export function insertTransactions(db: D1Database, key: string, transactions: NewTransaction[]): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO transactions (username_key, posted_at, description, type, category, amount_pence, reference)
       SELECT ?1, json_extract(value, '$.postedAt'), json_extract(value, '$.description'), json_extract(value, '$.type'),
              json_extract(value, '$.category'), json_extract(value, '$.amountPence'), json_extract(value, '$.reference')
       FROM json_each(?2)`,
    )
    .bind(key, JSON.stringify(transactions));
}

export const BALANCE_SQL =
  "(SELECT opening_balance_pence FROM accounts WHERE username_key = ?1) + COALESCE((SELECT SUM(amount_pence) FROM transactions WHERE username_key = ?1), 0)";

export const identityOf = (row: AccountRow): Identity => ({
  fullName: row.full_name,
  addressLine1: row.address_line1,
  townOrCity: row.town_or_city,
  postcode: row.postcode,
});

// Accounts opened before names and addresses existed get one the next time they are used.
export async function ensureIdentity(db: D1Database, row: AccountRow): Promise<AccountRow> {
  if (row.full_name) return row;
  const identity = makeIdentity(secureRandom);
  const nameOnCard = identity.fullName.toUpperCase();
  await db
    .prepare("UPDATE accounts SET full_name = ?, address_line1 = ?, town_or_city = ?, postcode = ?, name_on_card = ? WHERE username_key = ?")
    .bind(identity.fullName, identity.addressLine1, identity.townOrCity, identity.postcode, nameOnCard, row.username_key)
    .run();
  return {
    ...row,
    full_name: identity.fullName,
    address_line1: identity.addressLine1,
    town_or_city: identity.townOrCity,
    postcode: identity.postcode,
    name_on_card: nameOnCard,
  };
}

export async function findAccountRow(db: D1Database, key: string): Promise<AccountRow | null> {
  const found = await db.prepare("SELECT * FROM accounts WHERE username_key = ?").bind(key).first<AccountRow>();
  return found ? ensureIdentity(db, found) : null;
}

export async function loadAccount(db: D1Database, key: string): Promise<BankAccountView | null> {
  const account = await findAccountRow(db, key);
  if (!account) return null;

  const [{ results }] = await db.batch<TransactionRow>([
    db
      .prepare(
        "SELECT id, posted_at, description, type, category, amount_pence, reference FROM transactions WHERE username_key = ? ORDER BY posted_at, id",
      )
      .bind(key),
    db.prepare("UPDATE accounts SET last_used_at = ? WHERE username_key = ?").bind(new Date().toISOString(), key),
  ]);

  const transactions = results.map((row) => ({
    id: row.id,
    postedAt: row.posted_at,
    description: row.description,
    type: row.type,
    category: row.category,
    amountPence: row.amount_pence,
    reference: row.reference,
  }));

  return {
    username: account.username,
    ...identityOf(account),
    nameOnCard: account.name_on_card,
    cardNumber: account.card_number,
    expiry: account.expiry,
    cvv: account.cvv,
    sortCode: account.sort_code,
    accountNumber: account.account_number,
    openingBalancePence: account.opening_balance_pence,
    balancePence: transactions.reduce((sum, transaction) => sum + transaction.amountPence, account.opening_balance_pence),
    createdAt: account.created_at,
    transactions,
  };
}
