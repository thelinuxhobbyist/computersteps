import { usernameKey, validateUsername } from "./bank";
import { findAccountRow, identityOf, loadAccount } from "./accounts";
import { addDays, ukToday } from "./energy";
import { json, readJson, secureRandom } from "./http";
import { makeEnquiryReference, simulatedReply } from "./messaging";
import { debitSharedBalance, readIdempotencyKey } from "./payments";
import { COUNCIL, COUNCIL_INSTALMENT_PENCE, COUNCIL_REQUEST_KINDS, type CouncilRequestKind } from "./shared/council";
import type { CouncilAccount, CouncilBill, CouncilPayment, CouncilServiceRequest } from "./shared/council-types";

type CouncilRow = {
  username_key: string;
  resident_number: string;
  council_tax_reference: string;
  council_tax_band: string;
  created_at: string;
};

type BillRow = {
  id: number;
  reference: string;
  year_label: string;
  issued_on: string;
  period_start: string;
  due_on: string;
  instalment_number: number;
  instalments_total: number;
  amount_pence: number;
};

type PaymentRow = { id: number; paid_at: string; amount_pence: number; method: string; reference: string };
type RequestRow = {
  id: number;
  kind: string;
  topic: string;
  location: string | null;
  body: string;
  reference: string;
  status: string;
  submitted_at: string;
  reply_at: string | null;
  reply_body: string | null;
};

function readUsername(raw: string): string | null {
  const checked = validateUsername(raw);
  return "error" in checked ? null : usernameKey(checked.username);
}

function digits(count: number): string {
  return Array.from({ length: count }, () => Math.floor(secureRandom() * 10)).join("");
}

const BINS = {
  nextDate: "2026-10-21",
  binType: "Blue recycling bin",
  briefing: "Put the blue recycling bin out by 7am. The crew collects cardboard, paper, tins and plastic bottles.",
};

async function createCouncilAccount(db: D1Database, usernameKeyValue: string): Promise<void> {
  const now = new Date();
  const today = ukToday(now);
  const issuedOn = today;
  const dueOn = addDays(today, 14);
  const year = Number(today.slice(0, 4));
  const yearLabel = `${year}/${String(year + 1).slice(2)}`;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const residentNumber = `RC-${digits(5)}`;
    const councilTaxReference = `WK-${digits(8)}`;
    const billReference = `CT-${digits(6)}`;
    try {
      await db.batch([
        db
          .prepare(
            `INSERT INTO council_accounts (username_key, resident_number, council_tax_reference, council_tax_band, created_at)
             VALUES (?, ?, ?, 'C', ?)`,
          )
          .bind(usernameKeyValue, residentNumber, councilTaxReference, now.toISOString()),
        db
          .prepare(
            `INSERT INTO council_tax_bills (username_key, reference, year_label, issued_on, period_start, due_on, instalment_number, instalments_total, amount_pence)
             VALUES (?, ?, ?, ?, ?, ?, 1, 10, ?)`,
          )
          .bind(usernameKeyValue, billReference, yearLabel, issuedOn, `${year}-04-01`, dueOn, COUNCIL_INSTALMENT_PENCE),
      ]);
      return;
    } catch (error) {
      const message = String(error);
      if (message.includes("council_accounts.username_key")) return;
      if (!message.includes("UNIQUE")) throw error;
    }
  }
  throw new Error("Could not open a Westford Council account.");
}

function withPaymentStatus(bills: CouncilBill[], payments: CouncilPayment[]): CouncilBill[] {
  let remaining = payments.reduce((sum, payment) => sum + payment.amountPence, 0);
  return bills.map((bill) => {
    const paid = Math.min(bill.amountPence, remaining);
    remaining -= paid;
    return { ...bill, status: paid >= bill.amountPence ? "paid" : "unpaid" };
  });
}

export async function loadCouncil(db: D1Database, key: string): Promise<CouncilAccount | null> {
  const account = await findAccountRow(db, key);
  if (!account) return null;

  let council = await db.prepare("SELECT * FROM council_accounts WHERE username_key = ?").bind(key).first<CouncilRow>();
  if (!council) {
    await createCouncilAccount(db, key);
    council = await db.prepare("SELECT * FROM council_accounts WHERE username_key = ?").bind(key).first<CouncilRow>();
    if (!council) throw new Error("Council account was not created.");
  }

  const [bills, payments, requests] = await db.batch([
    db.prepare("SELECT * FROM council_tax_bills WHERE username_key = ? ORDER BY period_start, instalment_number, id").bind(key),
    db.prepare("SELECT id, paid_at, amount_pence, method, reference FROM council_tax_payments WHERE username_key = ? ORDER BY paid_at, id").bind(key),
    db
      .prepare(
        "SELECT id, kind, topic, location, body, reference, status, submitted_at, reply_at, reply_body FROM council_requests WHERE username_key = ? ORDER BY submitted_at DESC, id DESC LIMIT 20",
      )
      .bind(key),
    db.prepare("UPDATE accounts SET last_used_at = ? WHERE username_key = ?").bind(new Date().toISOString(), key),
  ]);

  const paymentList: CouncilPayment[] = (payments.results as PaymentRow[]).map((row) => ({
    id: row.id,
    paidAt: row.paid_at,
    amountPence: row.amount_pence,
    method: row.method,
    reference: row.reference,
  }));
  const billList = withPaymentStatus(
    (bills.results as BillRow[]).map((row) => ({
      id: row.id,
      reference: row.reference,
      yearLabel: row.year_label,
      issuedOn: row.issued_on,
      periodStart: row.period_start,
      dueOn: row.due_on,
      instalmentNumber: row.instalment_number,
      instalmentsTotal: row.instalments_total,
      amountPence: row.amount_pence,
      status: "unpaid" as const,
    })),
    paymentList,
  );
  const billed = billList.reduce((sum, bill) => sum + bill.amountPence, 0);
  const paid = paymentList.reduce((sum, payment) => sum + payment.amountPence, 0);
  const identity = identityOf(account);

  return {
    username: account.username,
    ...identity,
    residentNumber: council.resident_number,
    councilTaxReference: council.council_tax_reference,
    councilTaxBand: council.council_tax_band,
    balancePence: Math.max(0, billed - paid),
    bills: billList,
    payments: [...paymentList].reverse(),
    requests: (requests.results as RequestRow[]).map(
      (row): CouncilServiceRequest => ({
        id: row.id,
        kind: row.kind,
        topic: row.topic,
        location: row.location,
        body: row.body,
        reference: row.reference,
        status: row.status,
        submittedAt: row.submitted_at,
        replyAt: row.reply_at,
        replyBody: row.reply_body,
      }),
    ),
    bins: BINS,
  };
}

export async function getCouncil(env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  const council = key ? await loadCouncil(env.BANK_DB, key) : null;
  return council ? json({ council }) : json({ error: "account_not_found" }, 404);
}

async function rememberCouncilPayment(db: D1Database, key: string, paidAt: string, amountPence: number, reference: string): Promise<void> {
  await db
    .prepare(
      `INSERT INTO council_tax_payments (username_key, paid_at, amount_pence, method, reference)
       SELECT ?1, ?2, ?3, 'practice_bank', ?4
       WHERE NOT EXISTS (SELECT 1 FROM council_tax_payments WHERE username_key = ?1 AND reference = ?4)`,
    )
    .bind(key, paidAt, amountPence, reference)
    .run();
}

/** Pays the next unpaid council tax instalment from the shared Westford Bank balance. */
export async function payCouncilTax(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);
  const idempotencyKey = readIdempotencyKey(body.idempotencyKey);
  if (idempotencyKey === "invalid" || !idempotencyKey) return json({ error: "bad_idempotency_key" }, 400);

  const council = await loadCouncil(env.BANK_DB, key);
  if (!council) return json({ error: "account_not_found" }, 404);
  const next = council.bills.find((bill) => bill.status !== "paid");
  if (!next) return json({ error: "nothing_to_pay", council }, 400);

  const now = new Date().toISOString();
  const reference = `WC${Math.floor(secureRandom() * 10_000_000)
    .toString()
    .padStart(7, "0")}`;
  const debit = await debitSharedBalance(env.BANK_DB, {
    usernameKey: key,
    amountPence: next.amountPence,
    postedAt: now,
    description: COUNCIL.name,
    type: "Council Tax",
    category: "Bills",
    reference,
    idempotencyKey,
  });

  if (!debit.ok) {
    if (debit.error === "insufficient_funds") return json({ error: "insufficient_funds", balancePence: debit.balancePence, council }, 402);
    return json({ error: debit.error }, 409);
  }

  await rememberCouncilPayment(env.BANK_DB, key, now, next.amountPence, debit.reference);
  const [updated, bank] = await Promise.all([loadCouncil(env.BANK_DB, key), loadAccount(env.BANK_DB, key)]);
  return json({
    ok: true,
    duplicate: debit.duplicate,
    reference: debit.reference,
    amountPence: next.amountPence,
    balancePence: bank?.balancePence ?? debit.balancePence,
    council: updated,
  });
}

export async function sendCouncilRequest(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  const kind = COUNCIL_REQUEST_KINDS.find((item) => item === body.kind);
  const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 80) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";
  const location = typeof body.location === "string" ? body.location.trim().slice(0, 120) : "";
  const errors: Record<string, string> = {};
  if (!kind) errors.kind = "Choose the type of request.";
  if (topic.length < 2) errors.topic = "Choose a topic.";
  if (message.length < 10) errors.message = "Write a short message telling us how we can help (at least 10 letters).";
  if (Object.keys(errors).length > 0 || !kind) return json({ error: "invalid_request", errors }, 400);

  const council = await loadCouncil(env.BANK_DB, key);
  if (!council) return json({ error: "account_not_found" }, 404);

  const now = new Date();
  const sentAt = now.toISOString();
  const reply = simulatedReply(COUNCIL.name, council.fullName, topic);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = makeEnquiryReference("WC", now, secureRandom);
    try {
      await env.BANK_DB.prepare(
        `INSERT INTO council_requests (username_key, kind, topic, location, body, reference, status, submitted_at, reply_at, reply_body)
         VALUES (?, ?, ?, ?, ?, ?, 'replied', ?, ?, ?)`,
      )
        .bind(key, kind satisfies CouncilRequestKind, topic, location || null, message, reference, sentAt, sentAt, reply)
        .run();
      return json({ council: await loadCouncil(env.BANK_DB, key), reference }, 201);
    } catch (error) {
      if (!String(error).includes("UNIQUE")) throw error;
    }
  }
  throw new Error("Could not generate a unique council reference.");
}
