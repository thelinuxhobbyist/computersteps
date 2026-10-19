import { BALANCE_SQL, findAccountRow, identityOf } from "./accounts";
import { usernameKey, validateUsername } from "./bank";
import { json, readJson } from "./http";
import { findVacancy } from "./shared/job-catalogue";
import {
  MAIL_MESSAGE_CAP,
  MAIL_ORGS,
  MAIL_RETENTION_DAYS,
  checkOutgoing,
  findOrg,
  learnerAddress,
  organisationReply,
  replySubject,
  retentionCutoff,
  serviceMail,
  type MailDraft,
  type MailHolder,
  type ReplyContext,
} from "./shared/mail";

type MailRow = {
  id: number;
  mailbox: "inbox" | "sent";
  from_name: string;
  from_address: string;
  to_name: string;
  to_address: string;
  subject: string;
  body: string;
  sent_at: string;
  read_at: string | null;
  conversation_id: string;
  scenario: string;
  event_ref: string | null;
  attachments_json: string;
};

function present(row: MailRow) {
  let attachments: { name: string }[] = [];
  try {
    const parsed: unknown = JSON.parse(row.attachments_json);
    if (Array.isArray(parsed)) {
      attachments = parsed.flatMap((item) => (item && typeof item === "object" && "name" in item && typeof item.name === "string" ? [{ name: item.name }] : []));
    }
  } catch {
    attachments = [];
  }
  return {
    id: row.id,
    mailbox: row.mailbox,
    fromName: row.from_name,
    fromAddress: row.from_address,
    toName: row.to_name,
    toAddress: row.to_address,
    subject: row.subject,
    body: row.body,
    sentAt: row.sent_at,
    read: row.read_at !== null,
    conversationId: row.conversation_id,
    scenario: row.scenario,
    eventRef: row.event_ref,
    attachments,
  };
}

async function holderOf(db: D1Database, key: string): Promise<(MailHolder & { usernameKey: string }) | null> {
  const account = await findAccountRow(db, key);
  if (!account) return null;
  return { usernameKey: key, username: account.username, fullName: identityOf(account).fullName };
}

function accountKey(raw: string): string | null {
  const checked = validateUsername(raw);
  return "error" in checked ? null : usernameKey(checked.username);
}

export async function pruneMail(db: D1Database, now = new Date()): Promise<void> {
  await db.prepare("DELETE FROM mail_messages WHERE sent_at < ?").bind(retentionCutoff(now)).run();
}

async function capMailbox(db: D1Database, key: string): Promise<void> {
  await db
    .prepare(
      `DELETE FROM mail_messages WHERE username_key = ? AND id NOT IN (
         SELECT id FROM mail_messages WHERE username_key = ? ORDER BY sent_at DESC, id DESC LIMIT ?
       )`,
    )
    .bind(key, key, MAIL_MESSAGE_CAP)
    .run();
}

async function insertDrafts(db: D1Database, key: string, drafts: MailDraft[]): Promise<void> {
  const statement = db.prepare(
    `INSERT OR IGNORE INTO mail_messages
      (username_key, mailbox, from_name, from_address, to_name, to_address, subject, body, sent_at, visible_at, read_at, conversation_id, scenario, event_key, event_ref, attachments_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const draft of drafts) {
    await statement
      .bind(
        key,
        draft.mailbox,
        draft.fromName,
        draft.fromAddress,
        draft.toName,
        draft.toAddress,
        draft.subject,
        draft.body,
        draft.sentAt,
        draft.visibleAt,
        draft.mailbox === "sent" ? draft.sentAt : null,
        draft.conversationId,
        draft.scenario,
        draft.eventKey,
        draft.eventRef,
        JSON.stringify(draft.attachments),
      )
      .run();
  }
  await capMailbox(db, key);
}

/** Saves scenario mail. A mail problem must not undo the bank, job or bill action that caused it. */
export async function sendScenarioMail(db: D1Database, key: string, build: (holder: MailHolder) => MailDraft[]): Promise<void> {
  try {
    const holder = await holderOf(db, key);
    if (!holder) return;
    const drafts = build(holder);
    if (drafts.length === 0) return;
    await insertDrafts(db, key, drafts);
  } catch (error) {
    console.error(JSON.stringify({ message: "Practice mail was not saved", error: String(error) }));
  }
}

async function replyContext(db: D1Database, key: string): Promise<ReplyContext> {
  const empty: ReplyContext = {
    balancePence: null,
    transactions: [],
    application: null,
    councilReference: null,
    energyAccount: null,
    prescriptionReference: null,
    mobileNumber: null,
  };
  try {
    const balance = await db.prepare(`SELECT ${BALANCE_SQL} AS balance`).bind(key).first<{ balance: number }>();
    empty.balancePence = balance?.balance ?? null;
    const transactions = await db
      .prepare("SELECT description, amount_pence, posted_at, reference FROM transactions WHERE username_key = ? ORDER BY posted_at DESC, id DESC LIMIT 3")
      .bind(key)
      .all<{ description: string; amount_pence: number; posted_at: string; reference: string | null }>();
    empty.transactions = transactions.results.map((row) => ({
      description: row.description,
      amountPence: row.amount_pence,
      postedAt: row.posted_at,
      reference: row.reference,
    }));
  } catch {
    // The reply can still be written without a transaction list.
  }
  try {
    const application = await db
      .prepare("SELECT reference, job_id, status FROM job_applications WHERE username_key = ? ORDER BY submitted_at DESC LIMIT 1")
      .bind(key)
      .first<{ reference: string; job_id: string; status: string }>();
    if (application) {
      const job = findVacancy(application.job_id);
      empty.application = {
        reference: application.reference,
        title: job?.title ?? "Practice vacancy",
        employer: job?.employer ?? "Fictional employer",
        status: application.status,
      };
    }
  } catch {
    // Jobs may be unused for this learner.
  }
  try {
    const council = await db.prepare("SELECT reference FROM council_requests WHERE username_key = ? ORDER BY submitted_at DESC LIMIT 1").bind(key).first<{ reference: string }>();
    empty.councilReference = council?.reference ?? null;
  } catch {
    empty.councilReference = null;
  }
  try {
    const energy = await db.prepare("SELECT account_number FROM energy_accounts WHERE username_key = ?").bind(key).first<{ account_number: string }>();
    empty.energyAccount = energy?.account_number ?? null;
  } catch {
    empty.energyAccount = null;
  }
  try {
    const script = await db.prepare("SELECT reference FROM prescription_orders WHERE username_key = ? ORDER BY placed_at DESC LIMIT 1").bind(key).first<{ reference: string }>();
    empty.prescriptionReference = script?.reference ?? null;
  } catch {
    empty.prescriptionReference = null;
  }
  try {
    const mobile = await db.prepare("SELECT mobile_number FROM mobile_accounts WHERE username_key = ?").bind(key).first<{ mobile_number: string }>();
    empty.mobileNumber = mobile?.mobile_number ?? null;
  } catch {
    empty.mobileNumber = null;
  }
  return empty;
}

export async function getMailbox(env: Env, rawUsername: string): Promise<Response> {
  const key = accountKey(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const holder = await holderOf(env.BANK_DB, key);
  if (!holder) return json({ error: "account_not_found" }, 404);
  const now = new Date();
  await pruneMail(env.BANK_DB, now);
  await env.BANK_DB.prepare("UPDATE accounts SET last_used_at = ? WHERE username_key = ?").bind(now.toISOString(), key).run();
  const listed = await env.BANK_DB.prepare(
    `SELECT id, mailbox, from_name, from_address, to_name, to_address, subject, body, sent_at, read_at, conversation_id, scenario, event_ref, attachments_json
     FROM mail_messages WHERE username_key = ? AND visible_at <= ? ORDER BY sent_at DESC, id DESC`,
  )
    .bind(key, now.toISOString())
    .all<MailRow>();
  const pending = await env.BANK_DB.prepare("SELECT COUNT(*) AS count FROM mail_messages WHERE username_key = ? AND visible_at > ?")
    .bind(key, now.toISOString())
    .first<{ count: number }>();
  const messages = listed.results.map(present);
  return json({
    address: learnerAddress(holder.username),
    fullName: holder.fullName,
    username: holder.username,
    retentionDays: MAIL_RETENTION_DAYS,
    organisations: MAIL_ORGS.map((item) => ({ id: item.id, name: item.name, address: item.address })),
    pending: pending?.count ?? 0,
    messages,
  });
}

export async function markMailRead(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = accountKey(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  const id = body && typeof body.id === "number" ? body.id : 0;
  if (!id) return json({ error: "bad_request" }, 400);
  await env.BANK_DB.prepare("UPDATE mail_messages SET read_at = ? WHERE id = ? AND username_key = ? AND mailbox = 'inbox' AND read_at IS NULL")
    .bind(new Date().toISOString(), id, key)
    .run();
  return json({ ok: true });
}

export async function sendLearnerMail(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = accountKey(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const holder = await holderOf(env.BANK_DB, key);
  if (!holder) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request, 8000);
  if (!body) return json({ error: "bad_request" }, 400);
  const checked = checkOutgoing(body);
  if (!checked.ok) return json({ error: "invalid_message", errors: checked.errors }, 400);
  const destination = findOrg(checked.value.to);
  if (!destination || destination.id === "mail") return json({ error: "invalid_message", errors: { to: "Choose a practice organisation." } }, 400);

  let conversationId = `sent:${crypto.randomUUID()}`;
  let subject = checked.value.subject;
  if (checked.value.inReplyTo) {
    const previous = await env.BANK_DB.prepare("SELECT conversation_id, subject FROM mail_messages WHERE id = ? AND username_key = ?")
      .bind(checked.value.inReplyTo, key)
      .first<{ conversation_id: string; subject: string }>();
    if (!previous) return json({ error: "not_found" }, 404);
    conversationId = previous.conversation_id;
    subject = replySubject(previous.subject);
  }

  const now = new Date().toISOString();
  const sentKey = `sent:${crypto.randomUUID()}`;
  await insertDrafts(env.BANK_DB, key, [
    {
      mailbox: "sent",
      fromName: holder.fullName,
      fromAddress: learnerAddress(holder.username),
      toName: destination.name,
      toAddress: destination.address,
      subject,
      body: checked.value.message,
      sentAt: now,
      visibleAt: now,
      conversationId,
      scenario: destination.scenario,
      eventKey: sentKey,
      eventRef: null,
      attachments: checked.value.attachmentName ? [{ name: checked.value.attachmentName }] : [],
    },
  ]);

  const context = await replyContext(env.BANK_DB, key);
  const replyBody = organisationReply(destination.id, holder, subject, checked.value.message, checked.value.attachmentName, context);
  await insertDrafts(env.BANK_DB, key, [
    {
      mailbox: "inbox",
      fromName: destination.name,
      fromAddress: destination.address,
      toName: holder.fullName,
      toAddress: learnerAddress(holder.username),
      subject: replySubject(subject),
      body: replyBody,
      sentAt: now,
      visibleAt: now,
      conversationId,
      scenario: destination.scenario,
      eventKey: `reply:${sentKey}`,
      eventRef: null,
      attachments: [],
    },
  ]);
  return json({ ok: true }, 201);
}

export async function recordClientEvent(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = accountKey(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body || body.type !== "gp.consultation") return json({ error: "bad_request" }, 400);
  const reference = typeof body.reference === "string" ? body.reference.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 120) : "";
  if (!/^YC-\d{6}$/.test(reference) || reason.length < 2) return json({ error: "bad_request" }, 400);
  const at = new Date().toISOString();
  await sendScenarioMail(env.BANK_DB, key, (holder) =>
    serviceMail(holder, {
      from: "gp",
      scenario: "gp",
      subject: `Consultation received — ${reference}`,
      body: `Dear ${holder.fullName},

Yama Clinic has received your online consultation.

Reference: ${reference}
Reason: ${reason}

A clinician will look at this practice form. You do not need to do anything else unless we write again. This is not a real GP surgery.

Yama Clinic`,
      at,
      eventKey: `gp.consultation:${reference}`,
      eventRef: reference,
    }),
  );
  return json({ ok: true, reference }, 201);
}
