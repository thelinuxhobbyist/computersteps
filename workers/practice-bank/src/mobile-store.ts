import { usernameKey, validateUsername } from "./bank";
import { findAccountRow, identityOf, loadAccount } from "./accounts";
import { json, readJson, secureRandom } from "./http";
import { makeEnquiryReference, simulatedReply } from "./messaging";
import { debitSharedBalance, readIdempotencyKey } from "./payments";
import { sendScenarioMail } from "./mail-store";
import { movementMail, pounds, serviceMail } from "./shared/mail";
import { CURRENT_BILL_PENCE, MOBILE, MOBILE_TOPICS, PREVIOUS_BILL_PENCE, planById, usageFor, type MobilePlanId } from "./shared/mobile";
import type { MobileAccount, MobileBill, MobileMessage, MobilePayment } from "./shared/mobile-types";

function readUsername(raw: string): string | null {
  const checked = validateUsername(raw);
  return "error" in checked ? null : usernameKey(checked.username);
}

function digits(count: number): string {
  return Array.from({ length: count }, () => Math.floor(secureRandom() * 10)).join("");
}

async function createMobileAccount(db: D1Database, key: string): Promise<void> {
  const now = new Date().toISOString();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const customerNumber = `WM${digits(8)}`;
    const mobileNumber = `07700 9${digits(5)}`;
    try {
      await db.batch([
        db
          .prepare("INSERT INTO mobile_accounts (username_key, customer_number, mobile_number, plan_id, created_at) VALUES (?, ?, ?, 'everyday', ?)")
          .bind(key, customerNumber, mobileNumber, now),
        db
          .prepare("INSERT INTO mobile_bills (username_key, reference, period_label, issued_on, due_on, amount_pence) VALUES (?, ?, 'August 2026', '2026-09-01', '2026-09-14', ?)")
          .bind(key, `MB${digits(7)}`, PREVIOUS_BILL_PENCE),
        db
          .prepare("INSERT INTO mobile_bills (username_key, reference, period_label, issued_on, due_on, amount_pence) VALUES (?, ?, 'September 2026', '2026-10-01', '2026-10-28', ?)")
          .bind(key, `MB${digits(7)}`, CURRENT_BILL_PENCE),
        db
          .prepare("INSERT INTO mobile_payments (username_key, paid_at, amount_pence, reference) VALUES (?, '2026-09-10T09:00:00.000Z', ?, ?)")
          .bind(key, PREVIOUS_BILL_PENCE, `MP${digits(7)}`),
      ]);
      return;
    } catch (error) {
      const message = String(error);
      if (message.includes("mobile_accounts.username_key")) return;
      if (!message.includes("UNIQUE")) throw error;
    }
  }
  throw new Error("Could not open a Westford Mobile account.");
}

export async function loadMobile(db: D1Database, key: string): Promise<MobileAccount | null> {
  const account = await findAccountRow(db, key);
  if (!account) return null;
  let mobile = await db
    .prepare("SELECT customer_number, mobile_number, plan_id FROM mobile_accounts WHERE username_key = ?")
    .bind(key)
    .first<{ customer_number: string; mobile_number: string; plan_id: string }>();
  if (!mobile) {
    await createMobileAccount(db, key);
    mobile = await db
      .prepare("SELECT customer_number, mobile_number, plan_id FROM mobile_accounts WHERE username_key = ?")
      .bind(key)
      .first<{ customer_number: string; mobile_number: string; plan_id: string }>();
    if (!mobile) throw new Error("Mobile account was not created.");
  }

  const [bills, payments, messages] = await db.batch([
    db.prepare("SELECT id, reference, period_label, issued_on, due_on, amount_pence FROM mobile_bills WHERE username_key = ? ORDER BY issued_on").bind(key),
    db.prepare("SELECT id, paid_at, amount_pence, reference FROM mobile_payments WHERE username_key = ? ORDER BY paid_at").bind(key),
    db
      .prepare("SELECT id, sent_at, topic, message, reference, status, reply_body FROM mobile_messages WHERE username_key = ? ORDER BY sent_at DESC LIMIT 20")
      .bind(key),
    db.prepare("UPDATE accounts SET last_used_at = ? WHERE username_key = ?").bind(new Date().toISOString(), key),
  ]);

  const paymentList: MobilePayment[] = (payments.results as { id: number; paid_at: string; amount_pence: number; reference: string }[]).map((row) => ({
    id: row.id,
    paidAt: row.paid_at,
    amountPence: row.amount_pence,
    reference: row.reference,
  }));
  let remaining = paymentList.reduce((sum, payment) => sum + payment.amountPence, 0);
  const billList: MobileBill[] = (bills.results as { id: number; reference: string; period_label: string; issued_on: string; due_on: string; amount_pence: number }[]).map((row) => {
    const paid = Math.min(row.amount_pence, remaining);
    remaining -= paid;
    return {
      id: row.id,
      reference: row.reference,
      periodLabel: row.period_label,
      issuedOn: row.issued_on,
      dueOn: row.due_on,
      amountPence: row.amount_pence,
      status: paid >= row.amount_pence ? "paid" : "unpaid",
    };
  });
  const plan = planById(mobile.plan_id);
  const billed = billList.reduce((sum, bill) => sum + bill.amountPence, 0);
  const paid = paymentList.reduce((sum, payment) => sum + payment.amountPence, 0);

  return {
    username: account.username,
    ...identityOf(account),
    customerNumber: mobile.customer_number,
    mobileNumber: mobile.mobile_number,
    planId: plan.id,
    planName: plan.name,
    monthlyPence: plan.monthlyPence,
    balancePence: Math.max(0, billed - paid),
    usage: usageFor(plan.id),
    bills: [...billList].reverse(),
    payments: [...paymentList].reverse(),
    messages: (messages.results as { id: number; sent_at: string; topic: string; message: string; reference: string; status: string; reply_body: string | null }[]).map(
      (row): MobileMessage => ({
        id: row.id,
        sentAt: row.sent_at,
        topic: row.topic,
        message: row.message,
        reference: row.reference,
        status: row.status,
        replyBody: row.reply_body,
      }),
    ),
  };
}

export async function getMobile(env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  const mobile = key ? await loadMobile(env.BANK_DB, key) : null;
  return mobile ? json({ mobile }) : json({ error: "account_not_found" }, 404);
}

export async function payMobileBill(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);
  const idempotencyKey = readIdempotencyKey(body.idempotencyKey);
  if (!idempotencyKey || idempotencyKey === "invalid") return json({ error: "bad_idempotency_key" }, 400);

  const mobile = await loadMobile(env.BANK_DB, key);
  if (!mobile) return json({ error: "account_not_found" }, 404);
  const next = [...mobile.bills].reverse().find((bill) => bill.status !== "paid");
  if (!next) return json({ error: "nothing_to_pay", mobile }, 400);

  const now = new Date().toISOString();
  const reference = `MP${digits(7)}`;
  const debit = await debitSharedBalance(env.BANK_DB, {
    usernameKey: key,
    amountPence: next.amountPence,
    postedAt: now,
    description: MOBILE.name,
    type: "Mobile bill",
    category: "Bills",
    reference,
    idempotencyKey,
  });
  if (!debit.ok) {
    if (debit.error === "insufficient_funds") return json({ error: "insufficient_funds", balancePence: debit.balancePence, mobile }, 402);
    return json({ error: debit.error }, 409);
  }
  await env.BANK_DB.prepare(
    `INSERT INTO mobile_payments (username_key, paid_at, amount_pence, reference)
     SELECT ?1, ?2, ?3, ?4 WHERE NOT EXISTS (SELECT 1 FROM mobile_payments WHERE username_key = ?1 AND reference = ?4)`,
  )
    .bind(key, now, next.amountPence, debit.reference)
    .run();
  const [updated, bank] = await Promise.all([loadMobile(env.BANK_DB, key), loadAccount(env.BANK_DB, key)]);
  if (!debit.duplicate && updated) {
    await sendScenarioMail(env.BANK_DB, key, (holder) => [
      ...movementMail(holder, {
        description: MOBILE.name,
        amountPence: next.amountPence,
        reference: debit.reference,
        paidAt: now,
        balancePence: bank?.balancePence ?? debit.balancePence,
        kind: "card",
      }),
      ...serviceMail(holder, {
        from: "mobile",
        scenario: "mobile",
        subject: `Bill payment received — ${debit.reference}`,
        body: `Dear ${holder.fullName},

We have received ${pounds(next.amountPence)} for ${updated.mobileNumber}.

Reference: ${debit.reference}
Customer number: ${updated.customerNumber}

Westford Mobile`,
        at: now,
        eventKey: `mobile.payment:${debit.reference}`,
        eventRef: debit.reference,
      }),
    ]);
  }
  return json({ ok: true, reference: debit.reference, amountPence: next.amountPence, balancePence: bank?.balancePence ?? debit.balancePence, mobile: updated, duplicate: debit.duplicate });
}

export async function changeMobilePlan(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);
  const plan = planById(String(body.planId ?? ""));
  if (plan.id !== body.planId) return json({ error: "unknown_plan" }, 400);
  const mobile = await loadMobile(env.BANK_DB, key);
  if (!mobile) return json({ error: "account_not_found" }, 404);
  await env.BANK_DB.prepare("UPDATE mobile_accounts SET plan_id = ? WHERE username_key = ?").bind(plan.id satisfies MobilePlanId, key).run();
  const updated = await loadMobile(env.BANK_DB, key);
  if (updated) {
    await sendScenarioMail(env.BANK_DB, key, (holder) =>
      serviceMail(holder, {
        from: "mobile",
        scenario: "mobile",
        subject: `Plan changed to ${plan.name}`,
        body: `Dear ${holder.fullName},

Your practice plan for ${updated.mobileNumber} is now ${plan.name} at ${pounds(plan.monthlyPence)} a month.

This change is only inside Computer Steps.

Westford Mobile`,
        at: new Date().toISOString(),
        eventKey: `mobile.plan:${plan.id}:${new Date().toISOString()}`,
        eventRef: updated.customerNumber,
      }),
    );
  }
  return json({ mobile: updated });
}

export async function sendMobileMessage(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);
  const topic = MOBILE_TOPICS.find((item) => item.id === body.topic);
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";
  const errors: Record<string, string> = {};
  if (!topic) errors.topic = "Choose what your message is about.";
  if (message.length < 10) errors.message = "Write a short message telling us how we can help (at least 10 letters).";
  if (!topic || Object.keys(errors).length > 0) return json({ error: "invalid_message", errors }, 400);

  const mobile = await loadMobile(env.BANK_DB, key);
  if (!mobile) return json({ error: "account_not_found" }, 404);
  const now = new Date();
  const reply = simulatedReply(MOBILE.name, mobile.fullName, topic.label);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = makeEnquiryReference("WM", now, secureRandom);
    try {
      await env.BANK_DB.prepare(
        "INSERT INTO mobile_messages (username_key, sent_at, topic, message, reference, status, reply_at, reply_body) VALUES (?, ?, ?, ?, ?, 'replied', ?, ?)",
      )
        .bind(key, now.toISOString(), topic.id, message, reference, now.toISOString(), reply)
        .run();
      await sendScenarioMail(env.BANK_DB, key, (holder) =>
        serviceMail(holder, {
          from: "mobile",
          scenario: "mobile",
          subject: `Message received — ${reference}`,
          body: `Dear ${holder.fullName},

We have your message about “${topic.label}” for ${mobile.mobileNumber}.

Reference: ${reference}

A member of the team will look at it within two working days.

Westford Mobile`,
          at: now.toISOString(),
          eventKey: `mobile.message:${reference}`,
          eventRef: reference,
        }),
      );
      return json({ mobile: await loadMobile(env.BANK_DB, key), reference }, 201);
    } catch (error) {
      if (!String(error).includes("UNIQUE")) throw error;
    }
  }
  throw new Error("Could not generate a unique mobile reference.");
}
