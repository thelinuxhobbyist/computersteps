import { usernameKey, validateUsername } from "./bank";
import { findAccountRow, identityOf } from "./accounts";
import { ACTION_LABELS, findParcel, type DeliveryAction } from "./shared/deliveries";
import { json, readJson, secureRandom } from "./http";
import { makeEnquiryReference } from "./messaging";

function readUsername(raw: string): string | null {
  const checked = validateUsername(raw);
  return "error" in checked ? null : usernameKey(checked.username);
}

type RequestRow = { id: number; tracking_code: string; action: string; detail: string; reference: string; saved_at: string };

async function requestsFor(db: D1Database, key: string) {
  const { results } = await db
    .prepare("SELECT id, tracking_code, action, detail, reference, saved_at FROM delivery_requests WHERE username_key = ? ORDER BY saved_at DESC, id DESC LIMIT 30")
    .bind(key)
    .all<RequestRow>();
  return results.map((row) => ({
    id: row.id,
    trackingCode: row.tracking_code,
    action: row.action,
    detail: row.detail,
    reference: row.reference,
    savedAt: row.saved_at,
  }));
}

export async function getDeliveries(env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const account = await findAccountRow(env.BANK_DB, key);
  if (!account) return json({ error: "account_not_found" }, 404);
  await env.BANK_DB.prepare("UPDATE accounts SET last_used_at = ? WHERE username_key = ?").bind(new Date().toISOString(), key).run();
  return json({ identity: { username: account.username, ...identityOf(account) }, requests: await requestsFor(env.BANK_DB, key) });
}

export async function saveDeliveryRequest(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);
  const account = await findAccountRow(env.BANK_DB, key);
  if (!account) return json({ error: "account_not_found" }, 404);

  const action = String(body.action ?? "") as DeliveryAction;
  const detail = typeof body.detail === "string" ? body.detail.trim().slice(0, 300) : "";
  const code = String(body.trackingCode ?? "").replace(/\s/g, "").toUpperCase();
  if (action === "support") {
    if (detail.length < 10) return json({ error: "invalid_request", errors: { detail: "Write a short message (at least 10 letters)." } }, 400);
  } else {
    const parcel = findParcel(code);
    if (!parcel) return json({ error: "unknown_code" }, 404);
    if (!parcel.actions.includes(action)) return json({ error: "action_not_available" }, 400);
    if (action === "change_date" && !parcel.dateOptions.includes(detail)) {
      return json({ error: "invalid_request", errors: { detail: "Choose one of the available dates." } }, 400);
    }
    if (action !== "change_date" && action !== "collection_point" && detail.length < 3) {
      return json({ error: "invalid_request", errors: { detail: "Add a short instruction." } }, 400);
    }
  }

  const savedDetail = action === "collection_point" ? "Westford Library Counter, 12 Market Street, Westford, WE1 2AA. Monday to Friday 9am to 5pm. Saturday 9am to 1pm." : detail;
  const now = new Date();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const reference = makeEnquiryReference("WD", now, secureRandom);
    try {
      await env.BANK_DB.prepare(
        "INSERT INTO delivery_requests (username_key, tracking_code, action, detail, reference, saved_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
        .bind(key, action === "support" ? "GENERAL" : code, action, `${ACTION_LABELS[action] ?? action}: ${savedDetail}`, reference, now.toISOString())
        .run();
      return json({ reference, requests: await requestsFor(env.BANK_DB, key) }, 201);
    } catch (error) {
      if (!String(error).includes("UNIQUE")) throw error;
    }
  }
  throw new Error("Could not generate a unique delivery reference.");
}
