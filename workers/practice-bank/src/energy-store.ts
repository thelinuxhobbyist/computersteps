import { BROADBAND_PAYEE, OLD_BROADBAND_PAYEE, checkCardDetails, normaliseCardNumber, readCardDetails, usernameKey, validateUsername } from "./bank";
import { findAccountRow, identityOf, insertTransactions, loadAccount, type AccountRow } from "./accounts";
import {
  bankTransactionFor,
  billStatuses,
  buildEnergyHistory,
  checkDirectDebit,
  checkMessage,
  checkMeterReading,
  checkTransfer,
  makePaymentReference,
  readPaymentAmount,
  ukToday,
} from "./energy";
import { json, readJson, secureRandom } from "./http";
import { debitSharedBalance, readIdempotencyKey } from "./payments";
import { makeEnquiryReference, simulatedReply } from "./messaging";
import type { EnergyAccount, EnergyBill, EnergyMessage, EnergyPayment, EnergyReading } from "./shared/energy-types";
import type { MessageStatus } from "./shared/messaging-types";
import { BILL_ENQUIRY_TOPICS, WESTFORD, contactTopicLabel, type EnergyPaymentMethod } from "./shared/westford";

type EnergyRow = {
  username_key: string;
  account_number: string;
  meter_serial: string;
  payment_method: string;
  dd_account_name: string | null;
  dd_sort_code: string | null;
  dd_account_number: string | null;
  dd_day: number | null;
  dd_set_up_at: string | null;
  created_at: string;
};

type BillRow = {
  id: number;
  reference: string;
  issued_on: string;
  period_start: string;
  period_end: string;
  due_on: string;
  opening_reading: number;
  closing_reading: number;
  reading_type: string;
  kwh: number;
  unit_rate_pence: number;
  standing_charge_pence: number;
  days: number;
  amount_pence: number;
};

type PaymentRow = { id: number; paid_at: string; amount_pence: number; method: string; reference: string };
type ReadingRow = { id: number; read_on: string; submitted_at: string; reading: number; source: string };
type MessageRow = {
  id: number;
  sent_at: string;
  topic: string;
  message: string;
  reference: string | null;
  status: string;
  reply_at: string | null;
  reply_body: string | null;
};

function readUsername(raw: string): string | null {
  const checked = validateUsername(raw);
  return "error" in checked ? null : usernameKey(checked.username);
}

/**
 * Opens a Westford Energy account for an existing Practice Bank identity.
 * Past energy payments are copied into the bank history, and the bank's opening balance goes up
 * by the same amount, so the learner's current balance does not change.
 */
async function createEnergyAccount(db: D1Database, account: AccountRow): Promise<void> {
  const now = new Date();
  const history = buildEnergyHistory(ukToday(now), secureRandom);
  const key = account.username_key;
  const paidTotal = history.payments.reduce((sum, payment) => sum + payment.amountPence, 0);

  try {
    await db.batch([
      db
        .prepare("INSERT INTO energy_accounts (username_key, account_number, meter_serial, created_at) VALUES (?, ?, ?, ?)")
        .bind(key, history.accountNumber, history.meterSerial, now.toISOString()),
      db
        .prepare(
          `INSERT INTO energy_bills (username_key, reference, issued_on, period_start, period_end, due_on, opening_reading, closing_reading,
             reading_type, kwh, unit_rate_pence, standing_charge_pence, days, amount_pence)
           SELECT ?1, json_extract(value, '$.reference'), json_extract(value, '$.issuedOn'), json_extract(value, '$.periodStart'),
             json_extract(value, '$.periodEnd'), json_extract(value, '$.dueOn'), json_extract(value, '$.openingReading'),
             json_extract(value, '$.closingReading'), json_extract(value, '$.readingType'), json_extract(value, '$.kwh'),
             json_extract(value, '$.unitRatePence'), json_extract(value, '$.standingChargePence'), json_extract(value, '$.days'),
             json_extract(value, '$.amountPence')
           FROM json_each(?2)`,
        )
        .bind(key, JSON.stringify(history.bills)),
      db
        .prepare(
          `INSERT INTO energy_payments (username_key, paid_at, amount_pence, method, reference)
           SELECT ?1, json_extract(value, '$.paidAt'), json_extract(value, '$.amountPence'), json_extract(value, '$.method'), json_extract(value, '$.reference')
           FROM json_each(?2)`,
        )
        .bind(key, JSON.stringify(history.payments)),
      db
        .prepare(
          `INSERT INTO energy_readings (username_key, read_on, submitted_at, reading, source)
           SELECT ?1, json_extract(value, '$.readOn'), json_extract(value, '$.submittedAt'), json_extract(value, '$.reading'), json_extract(value, '$.source')
           FROM json_each(?2)`,
        )
        .bind(key, JSON.stringify(history.readings)),
      insertTransactions(db, key, history.payments.map(bankTransactionFor)),
      db.prepare("UPDATE accounts SET opening_balance_pence = opening_balance_pence + ? WHERE username_key = ?").bind(paidTotal, key),
      // Older bank histories called the broadband company an energy company, which would contradict Westford Energy.
      db.prepare("UPDATE transactions SET description = ? WHERE username_key = ? AND description = ?").bind(BROADBAND_PAYEE, key, OLD_BROADBAND_PAYEE),
    ]);
  } catch (error) {
    // Two tabs opening the account at the same moment: the other one won, which is fine.
    if (!String(error).includes("energy_accounts.username_key")) throw error;
  }
}

/** Loads the energy account, opening it first if this identity has never visited Westford Energy. */
export async function loadEnergy(db: D1Database, key: string): Promise<EnergyAccount | null> {
  const account = await findAccountRow(db, key);
  if (!account) return null;

  let energy = await db.prepare("SELECT * FROM energy_accounts WHERE username_key = ?").bind(key).first<EnergyRow>();
  if (!energy) {
    await createEnergyAccount(db, account);
    energy = await db.prepare("SELECT * FROM energy_accounts WHERE username_key = ?").bind(key).first<EnergyRow>();
    if (!energy) throw new Error("Energy account was not created.");
  }

  const now = new Date();
  const [bills, payments, readings, messageRows] = await db.batch([
    db.prepare("SELECT * FROM energy_bills WHERE username_key = ? ORDER BY period_start").bind(key),
    db.prepare("SELECT id, paid_at, amount_pence, method, reference FROM energy_payments WHERE username_key = ? ORDER BY paid_at, id").bind(key),
    db.prepare("SELECT id, read_on, submitted_at, reading, source FROM energy_readings WHERE username_key = ? ORDER BY submitted_at DESC, id DESC").bind(key),
    db
      .prepare(
        "SELECT id, sent_at, topic, message, reference, status, reply_at, reply_body FROM energy_messages WHERE username_key = ? ORDER BY sent_at DESC, id DESC LIMIT 20",
      )
      .bind(key),
    db.prepare("UPDATE accounts SET last_used_at = ? WHERE username_key = ?").bind(now.toISOString(), key),
  ]);

  const today = ukToday(now);
  const paymentList: EnergyPayment[] = (payments.results as PaymentRow[]).map((row) => ({
    id: row.id,
    paidAt: row.paid_at,
    amountPence: row.amount_pence,
    method: row.method as EnergyPaymentMethod,
    reference: row.reference,
  }));

  const billList: EnergyBill[] = billStatuses(
    (bills.results as BillRow[]).map((row) => ({
      id: row.id,
      reference: row.reference,
      issuedOn: row.issued_on,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      dueOn: row.due_on,
      openingReading: row.opening_reading,
      closingReading: row.closing_reading,
      readingType: row.reading_type === "estimated" ? ("estimated" as const) : ("actual" as const),
      kwh: row.kwh,
      unitRatePence: row.unit_rate_pence,
      standingChargePence: row.standing_charge_pence,
      days: row.days,
      energyChargePence: row.kwh * row.unit_rate_pence,
      standingTotalPence: row.days * row.standing_charge_pence,
      amountPence: row.amount_pence,
    })),
    paymentList,
    today,
  ).reverse();

  const billedTotal = billList.reduce((sum, bill) => sum + bill.amountPence, 0);
  const paidTotal = paymentList.reduce((sum, payment) => sum + payment.amountPence, 0);
  const messages: EnergyMessage[] = (messageRows.results as MessageRow[]).map((row) => ({
    id: row.id,
    sentAt: row.sent_at,
    topic: row.topic,
    message: row.message,
    reference: row.reference ?? `WE-LEGACY-${row.id}`,
    status: row.status === "replied" ? "replied" : ("received" as MessageStatus),
    replyAt: row.reply_at,
    replyBody: row.reply_body,
  }));
  const askedAboutBill = messages.some((item) => (BILL_ENQUIRY_TOPICS as readonly string[]).includes(item.topic));

  return {
    username: account.username,
    ...identityOf(account),
    accountNumber: energy.account_number,
    meterSerial: energy.meter_serial,
    tariffName: WESTFORD.tariff.name,
    unitRatePence: WESTFORD.tariff.unitRatePence,
    standingChargePence: WESTFORD.tariff.standingChargePence,
    directDebit:
      energy.payment_method === "direct_debit" && energy.dd_day
        ? {
            accountName: energy.dd_account_name ?? "",
            sortCode: energy.dd_sort_code ?? "",
            accountNumberEnding: (energy.dd_account_number ?? "").slice(-4),
            day: energy.dd_day,
            setUpAt: energy.dd_set_up_at ?? "",
          }
        : null,
    balancePence: billedTotal - paidTotal,
    bills: billList,
    payments: [...paymentList].reverse(),
    readings: (readings.results as ReadingRow[]).map(
      (row): EnergyReading => ({
        id: row.id,
        readOn: row.read_on,
        submittedAt: row.submitted_at,
        reading: row.reading,
        source: row.source as EnergyReading["source"],
      }),
    ),
    messages,
    billAttention: billedTotal - paidTotal > 0 && !askedAboutBill,
    createdAt: energy.created_at,
    today,
  };
}

export async function getEnergy(env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  const energy = key ? await loadEnergy(env.BANK_DB, key) : null;
  return energy ? json({ energy }) : json({ error: "account_not_found" }, 404);
}

/** Pays the energy bill with a Practice Bank card. The bank payment and the energy payment are saved together. */
export async function payEnergyByCard(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  const amountPence = readPaymentAmount(body.amountPence);
  if (amountPence === null) return json({ error: "bad_amount" }, 400);

  const energy = await loadEnergy(env.BANK_DB, key);
  if (!energy) return json({ error: "account_not_found" }, 404);

  const details = readCardDetails(body);
  const card = await env.BANK_DB.prepare("SELECT * FROM accounts WHERE card_number = ?").bind(normaliseCardNumber(details.cardNumber)).first<AccountRow>();
  if (!card) return json({ error: "card_not_found" }, 404);
  if (card.username_key !== key) return json({ error: "not_your_card" }, 400);

  const errors = checkCardDetails({ nameOnCard: card.name_on_card, cardNumber: card.card_number, expiry: card.expiry, cvv: card.cvv }, details);
  if (Object.keys(errors).length > 0) return json({ error: "card_details_wrong", errors }, 400);

  const idempotencyKey = readIdempotencyKey(body.idempotencyKey);
  if (idempotencyKey === "invalid") return json({ error: "bad_idempotency_key" }, 400);

  return takeEnergyPayment(env.BANK_DB, key, amountPence, "card_online", idempotencyKey);
}

/** Money leaves Practice Bank only if there is enough, and Westford Energy records it only if it left. */
async function takeEnergyPayment(
  db: D1Database,
  key: string,
  amountPence: number,
  method: EnergyPaymentMethod,
  idempotencyKey: string | null,
): Promise<Response> {
  const now = new Date().toISOString();
  const reference = makePaymentReference(secureRandom);
  const transaction = bankTransactionFor({ paidAt: now, amountPence, method, reference });
  const debit = await debitSharedBalance(db, {
    usernameKey: key,
    amountPence,
    postedAt: now,
    description: transaction.description,
    type: transaction.type,
    category: transaction.category,
    reference,
    idempotencyKey,
  });

  if (!debit.ok) {
    if (debit.error === "insufficient_funds") return json({ error: "insufficient_funds", balancePence: debit.balancePence }, 402);
    return json({ error: debit.error }, 409);
  }

  await db
    .prepare(
      `INSERT INTO energy_payments (username_key, paid_at, amount_pence, method, reference)
       SELECT ?1, ?2, ?3, ?4, ?5
       WHERE EXISTS (SELECT 1 FROM transactions WHERE username_key = ?1 AND reference = ?5)
         AND NOT EXISTS (SELECT 1 FROM energy_payments WHERE username_key = ?1 AND reference = ?5)`,
    )
    .bind(key, now, amountPence, method, debit.reference)
    .run();

  const [bank, energy] = await Promise.all([loadAccount(db, key), loadEnergy(db, key)]);
  return json({
    ok: true,
    duplicate: debit.duplicate,
    reference: debit.reference,
    amountPence,
    balancePence: bank?.balancePence ?? null,
    energy,
  });
}

/** "Pay a bill" in Practice Bank. */
export async function payByBankTransfer(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  const account = await findAccountRow(env.BANK_DB, key);
  if (!account) return json({ error: "account_not_found" }, 404);
  const energy = await env.BANK_DB.prepare("SELECT account_number FROM energy_accounts WHERE username_key = ?").bind(key).first<{ account_number: string }>();

  const checked = checkTransfer(body, energy?.account_number ?? null);
  if ("errors" in checked) return json({ error: "invalid_transfer", errors: checked.errors }, 400);

  const idempotencyKey = readIdempotencyKey(body.idempotencyKey);
  if (idempotencyKey === "invalid") return json({ error: "bad_idempotency_key" }, 400);

  return takeEnergyPayment(env.BANK_DB, key, checked.request.amountPence, "bank_transfer", idempotencyKey);
}

export async function setUpDirectDebit(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  const account = await findAccountRow(env.BANK_DB, key);
  if (!account) return json({ error: "account_not_found" }, 404);
  await loadEnergy(env.BANK_DB, key);

  const checked = checkDirectDebit(body, identityOf(account), { sortCode: account.sort_code, accountNumber: account.account_number });
  if ("errors" in checked) return json({ error: "invalid_direct_debit", errors: checked.errors }, 400);

  const { accountName, sortCode, accountNumber, day } = checked.request;
  await env.BANK_DB.prepare(
    `UPDATE energy_accounts SET payment_method = 'direct_debit', dd_account_name = ?, dd_sort_code = ?, dd_account_number = ?, dd_day = ?, dd_set_up_at = ?
     WHERE username_key = ?`,
  )
    .bind(accountName, sortCode, accountNumber, day, new Date().toISOString(), key)
    .run();

  return json({ energy: await loadEnergy(env.BANK_DB, key) });
}

export async function cancelDirectDebit(env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  await env.BANK_DB.prepare(
    `UPDATE energy_accounts SET payment_method = 'pay_on_receipt', dd_account_name = NULL, dd_sort_code = NULL, dd_account_number = NULL, dd_day = NULL,
       dd_set_up_at = NULL WHERE username_key = ?`,
  )
    .bind(key)
    .run();
  const energy = await loadEnergy(env.BANK_DB, key);
  return energy ? json({ energy }) : json({ error: "account_not_found" }, 404);
}

export async function submitMeterReading(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  const energy = await loadEnergy(env.BANK_DB, key);
  if (!energy) return json({ error: "account_not_found" }, 404);

  const lastActual = energy.readings.find((reading) => reading.source !== "estimated")?.reading ?? 0;
  const checked = checkMeterReading(body, lastActual);
  if ("errors" in checked) return json({ error: "invalid_reading", errors: checked.errors }, 400);

  const now = new Date();
  await env.BANK_DB.prepare("INSERT INTO energy_readings (username_key, read_on, submitted_at, reading, source) VALUES (?, ?, ?, ?, 'customer')")
    .bind(key, ukToday(now), now.toISOString(), checked.reading)
    .run();

  return json({ energy: await loadEnergy(env.BANK_DB, key) }, 201);
}

export async function sendEnergyMessage(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  const checked = checkMessage(body);
  if ("errors" in checked) return json({ error: "invalid_message", errors: checked.errors }, 400);

  const energy = await loadEnergy(env.BANK_DB, key);
  if (!energy) return json({ error: "account_not_found" }, 404);

  const now = new Date();
  const sentAt = now.toISOString();
  const reply = simulatedReply(WESTFORD.name, energy.fullName, contactTopicLabel(checked.topic));

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = makeEnquiryReference("WE", now, secureRandom);
    try {
      await env.BANK_DB.prepare(
        `INSERT INTO energy_messages (username_key, sent_at, topic, message, reference, status, reply_at, reply_body)
         VALUES (?, ?, ?, ?, ?, 'replied', ?, ?)`,
      )
        .bind(key, sentAt, checked.topic, checked.message, reference, sentAt, reply)
        .run();
      return json({ energy: await loadEnergy(env.BANK_DB, key) }, 201);
    } catch (error) {
      if (!String(error).includes("energy_messages.reference") && !String(error).includes("UNIQUE")) throw error;
    }
  }

  throw new Error("Could not generate a unique message reference.");
}
