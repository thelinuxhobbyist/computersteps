import {
  buildStarterHistory,
  checkCardDetails,
  checkDeliveryDetails,
  cleanReference,
  makeCard,
  makeIdentity,
  normaliseCardNumber,
  readAmount,
  readCardDetails,
  readDeliveryDetails,
  usernameKey,
  validateUsername,
  type Identity,
  type NewTransaction,
} from "./bank";
import { corsHeaders, json, readJson, secureRandom } from "./http";
import { createPatient, getPatient, orderPrescription } from "./patients";

const INACTIVE_DAYS = 365;

type AccountRow = {
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

// One statement for the whole history: the free D1 plan allows only 50 queries per request.
function insertTransactions(db: D1Database, key: string, transactions: NewTransaction[]): D1PreparedStatement {
  return db
    .prepare(
      `INSERT INTO transactions (username_key, posted_at, description, type, category, amount_pence, reference)
       SELECT ?1, json_extract(value, '$.postedAt'), json_extract(value, '$.description'), json_extract(value, '$.type'),
              json_extract(value, '$.category'), json_extract(value, '$.amountPence'), json_extract(value, '$.reference')
       FROM json_each(?2)`,
    )
    .bind(key, JSON.stringify(transactions));
}

const identityOf = (row: AccountRow): Identity => ({
  fullName: row.full_name,
  addressLine1: row.address_line1,
  townOrCity: row.town_or_city,
  postcode: row.postcode,
});

// Accounts opened before names and addresses existed get one the next time they are used.
async function ensureIdentity(db: D1Database, row: AccountRow): Promise<AccountRow> {
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

async function loadAccount(db: D1Database, key: string) {
  const found = await db.prepare("SELECT * FROM accounts WHERE username_key = ?").bind(key).first<AccountRow>();
  if (!found) return null;
  const account = await ensureIdentity(db, found);

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

async function createAccount(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  const checked = validateUsername(body.username);
  if ("error" in checked) return json({ error: "invalid_username", message: checked.error }, 400);

  const key = usernameKey(checked.username);
  const existing = await env.BANK_DB.prepare("SELECT 1 FROM accounts WHERE username_key = ?").bind(key).first();
  if (existing) return json({ error: "username_taken" }, 409);

  const now = new Date();
  const history = buildStarterHistory(now, secureRandom);

  const identity = makeIdentity(secureRandom);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const card = makeCard(identity.fullName, now, secureRandom);
    try {
      await env.BANK_DB.batch([
        env.BANK_DB.prepare(
          `INSERT INTO accounts (username_key, username, name_on_card, card_number, expiry, cvv, sort_code, account_number,
             opening_balance_pence, created_at, last_used_at, full_name, address_line1, town_or_city, postcode)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          key,
          checked.username,
          card.nameOnCard,
          card.cardNumber,
          card.expiry,
          card.cvv,
          card.sortCode,
          card.accountNumber,
          history.openingBalancePence,
          now.toISOString(),
          now.toISOString(),
          identity.fullName,
          identity.addressLine1,
          identity.townOrCity,
          identity.postcode,
        ),
        insertTransactions(env.BANK_DB, key, history.transactions),
      ]);
      return json({ account: await loadAccount(env.BANK_DB, key) }, 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("accounts.username_key")) return json({ error: "username_taken" }, 409);
      if (!message.includes("accounts.card_number")) throw error;
    }
  }

  throw new Error("Could not generate a unique card number.");
}

async function takePayment(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  const amountPence = readAmount(body.amountPence);
  if (amountPence === null) return json({ error: "bad_amount" }, 400);

  const details = readCardDetails(body);
  const found = await env.BANK_DB.prepare("SELECT * FROM accounts WHERE card_number = ?")
    .bind(normaliseCardNumber(details.cardNumber))
    .first<AccountRow>();
  if (!found) return json({ error: "card_not_found" }, 404);
  const account = await ensureIdentity(env.BANK_DB, found);

  const errors = {
    ...checkDeliveryDetails(identityOf(account), readDeliveryDetails(body)),
    ...checkCardDetails(
      { nameOnCard: account.name_on_card, cardNumber: account.card_number, expiry: account.expiry, cvv: account.cvv },
      details,
    ),
  };
  if (Object.keys(errors).length > 0) return json({ error: "card_details_wrong", errors }, 400);

  const key = account.username_key;
  const now = new Date().toISOString();
  const balanceSql =
    "(SELECT opening_balance_pence FROM accounts WHERE username_key = ?1) + COALESCE((SELECT SUM(amount_pence) FROM transactions WHERE username_key = ?1), 0)";

  // A single conditional insert, so two payments at once cannot overspend the account.
  const [inserted] = await env.BANK_DB.batch([
    env.BANK_DB.prepare(
      `INSERT INTO transactions (username_key, posted_at, description, type, category, amount_pence, reference)
       SELECT ?1, ?2, 'Practice Shop', 'Card payment', 'Shopping', ?3, ?4
       WHERE ${balanceSql} >= ?5`,
    ).bind(key, now, -amountPence, cleanReference(body.reference), amountPence),
    env.BANK_DB.prepare("UPDATE accounts SET last_used_at = ?2 WHERE username_key = ?1").bind(key, now),
  ]);

  const balance = await env.BANK_DB.prepare(`SELECT ${balanceSql} AS balance`).bind(key).first<number>("balance");
  if (inserted.meta.changes === 0) return json({ error: "insufficient_funds", balancePence: balance }, 402);

  return json({ ok: true, username: account.username, balancePence: balance });
}

const practiceBankWorker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const { pathname } = new URL(request.url);

    try {
      if (request.method === "POST" && pathname === "/accounts") return await createAccount(request, env);
      if (request.method === "POST" && pathname === "/payments") return await takePayment(request, env);
      if (request.method === "POST" && pathname === "/patients") return await createPatient(request, env);

      const patientMatch = pathname.match(/^\/patients\/([^/]+)(\/prescriptions)?$/);
      if (patientMatch) {
        const username = decodeURIComponent(patientMatch[1]);
        if (request.method === "GET" && !patientMatch[2]) return await getPatient(env, username);
        if (request.method === "POST" && patientMatch[2]) return await orderPrescription(request, env, username);
      }

      const match = pathname.match(/^\/accounts\/([^/]+)$/);
      if (request.method === "GET" && match) {
        const checked = validateUsername(decodeURIComponent(match[1]));
        if ("error" in checked) return json({ error: "account_not_found" }, 404);
        const account = await loadAccount(env.BANK_DB, usernameKey(checked.username));
        return account ? json({ account }) : json({ error: "account_not_found" }, 404);
      }

      if (request.method === "GET" && pathname === "/") {
        return new Response("Computer Steps Practice Bank and Yama Clinic are running.", { headers: corsHeaders });
      }
      return json({ error: "not_found" }, 404);
    } catch (error) {
      console.error(JSON.stringify({ message: "Practice Bank request failed", path: pathname, error: String(error) }));
      return json({ error: "server_error" }, 500);
    }
  },

  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const cutoff = new Date(Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const [accounts, patients] = await env.BANK_DB.batch([
      env.BANK_DB.prepare("DELETE FROM accounts WHERE last_used_at < ?").bind(cutoff),
      env.BANK_DB.prepare("DELETE FROM patients WHERE last_used_at < ?").bind(cutoff),
    ]);
    console.log(
      JSON.stringify({ message: "Closed inactive practice accounts", accounts: accounts.meta.changes, patients: patients.meta.changes }),
    );
  },
};

export default practiceBankWorker;
