import { checkCardDetails, checkDeliveryDetails, normaliseCardNumber, readCardDetails, readDeliveryDetails, usernameKey, validateUsername } from "./bank";
import { findAccountRow, identityOf, loadAccount } from "./accounts";
import { json, readJson, secureRandom } from "./http";
import { makeEnquiryReference } from "./messaging";
import { creditSharedBalance, debitSharedBalance, readIdempotencyKey } from "./payments";
import { TRAVEL, quoteTrip, type TravelQuote } from "./shared/travel";

function readUsername(raw: string): string | null {
  const checked = validateUsername(raw);
  return "error" in checked ? null : usernameKey(checked.username);
}

type BookingRow = {
  reference: string;
  summary_json: string;
  total_pence: number;
  status: string;
  payment_reference: string | null;
  created_at: string;
};

function present(row: BookingRow) {
  let quote: TravelQuote | null = null;
  try {
    quote = JSON.parse(row.summary_json) as TravelQuote;
  } catch {
    quote = null;
  }
  return {
    reference: row.reference,
    quote,
    totalPence: row.total_pence,
    status: row.status,
    paymentReference: row.payment_reference,
    createdAt: row.created_at,
  };
}

async function bookingsFor(db: D1Database, key: string) {
  const { results } = await db
    .prepare("SELECT reference, summary_json, total_pence, status, payment_reference, created_at FROM travel_bookings WHERE username_key = ? ORDER BY created_at DESC")
    .bind(key)
    .all<BookingRow>();
  return results.map(present);
}

export async function getTravel(env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const account = await findAccountRow(env.BANK_DB, key);
  if (!account) return json({ error: "account_not_found" }, 404);
  await env.BANK_DB.prepare("UPDATE accounts SET last_used_at = ? WHERE username_key = ?").bind(new Date().toISOString(), key).run();
  return json({ identity: { username: account.username, ...identityOf(account) }, bookings: await bookingsFor(env.BANK_DB, key) });
}

export async function bookTrip(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);
  const idempotencyKey = readIdempotencyKey(body.idempotencyKey);
  if (!idempotencyKey || idempotencyKey === "invalid") return json({ error: "bad_idempotency_key" }, 400);
  const account = await findAccountRow(env.BANK_DB, key);
  if (!account) return json({ error: "account_not_found" }, 404);

  const identity = identityOf(account);
  const priced = quoteTrip({
    flightId: typeof body.flightId === "string" ? body.flightId : undefined,
    returnFlightId: typeof body.returnFlightId === "string" ? body.returnFlightId : undefined,
    stayId: typeof body.stayId === "string" ? body.stayId : undefined,
    checkIn: typeof body.checkIn === "string" ? body.checkIn : undefined,
    checkOut: typeof body.checkOut === "string" ? body.checkOut : undefined,
    guests: Number(body.guests),
    departDate: typeof body.departDate === "string" ? body.departDate : undefined,
    returnDate: typeof body.returnDate === "string" ? body.returnDate : undefined,
  });
  if (!priced.ok) return json({ error: "invalid_booking", message: priced.error }, 400);

  const card = readCardDetails(body);
  const address = readDeliveryDetails(body);
  const errors: Record<string, string> = {
    ...checkDeliveryDetails(identity, address),
    ...checkCardDetails({ nameOnCard: account.name_on_card, cardNumber: account.card_number, expiry: account.expiry, cvv: account.cvv }, card),
  };
  if (normaliseCardNumber(card.cardNumber) !== account.card_number) {
    errors.cardNumber = "We don't recognise this card number. Use the card Westford Bank gave you when you registered.";
  }
  if (Object.keys(errors).length > 0) return json({ error: "card_details_wrong", errors }, 400);

  const quote = { ...priced.quote, passengerName: identity.fullName };
  const now = new Date();
  const paymentReference = `WT${Math.floor(secureRandom() * 10_000_000).toString().padStart(7, "0")}`;
  const debit = await debitSharedBalance(env.BANK_DB, {
    usernameKey: key,
    amountPence: priced.quote.totalPence,
    postedAt: now.toISOString(),
    description: TRAVEL.name,
    type: "Travel booking",
    category: "Travel",
    reference: paymentReference,
    idempotencyKey,
  });
  if (!debit.ok) {
    if (debit.error === "insufficient_funds") return json({ error: "insufficient_funds", balancePence: debit.balancePence }, 402);
    return json({ error: debit.error }, 409);
  }

  const existing = await env.BANK_DB.prepare("SELECT reference FROM travel_bookings WHERE payment_reference = ?").bind(debit.reference).first<{ reference: string }>();
  let reference = existing?.reference;
  if (!reference) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      reference = makeEnquiryReference("WT", now, secureRandom);
      try {
        await env.BANK_DB.prepare(
          "INSERT INTO travel_bookings (username_key, reference, summary_json, total_pence, status, payment_reference, created_at) VALUES (?, ?, ?, ?, 'confirmed', ?, ?)",
        )
          .bind(key, reference, JSON.stringify(quote), quote.totalPence, debit.reference, now.toISOString())
          .run();
        break;
      } catch (error) {
        if (!String(error).includes("UNIQUE")) throw error;
        reference = undefined;
      }
    }
  }
  if (!reference) throw new Error("Could not save the booking.");
  const bank = await loadAccount(env.BANK_DB, key);
  return json({ ok: true, reference, duplicate: debit.duplicate, balancePence: bank?.balancePence ?? debit.balancePence, bookings: await bookingsFor(env.BANK_DB, key) });
}

export async function cancelTrip(request: Request, env: Env, rawUsername: string, reference: string): Promise<Response> {
  const key = readUsername(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const booking = await env.BANK_DB.prepare("SELECT * FROM travel_bookings WHERE username_key = ? AND reference = ?")
    .bind(key, reference)
    .first<BookingRow & { username_key: string }>();
  if (!booking) return json({ error: "not_found" }, 404);
  if (booking.status === "cancelled") return json({ ok: true, duplicate: true, bookings: await bookingsFor(env.BANK_DB, key) });

  const now = new Date().toISOString();
  const credit = await creditSharedBalance(env.BANK_DB, {
    usernameKey: key,
    amountPence: booking.total_pence,
    postedAt: now,
    description: `${TRAVEL.name} refund`,
    type: "Refund",
    category: "Travel",
    reference: `RF${booking.reference}`,
    idempotencyKey: `refund-${booking.reference}`,
  });
  if (!credit.ok) return json({ error: credit.error }, 409);
  await env.BANK_DB.prepare("UPDATE travel_bookings SET status = 'cancelled' WHERE username_key = ? AND reference = ?").bind(key, reference).run();
  const bank = await loadAccount(env.BANK_DB, key);
  return json({ ok: true, balancePence: bank?.balancePence ?? credit.balancePence, bookings: await bookingsFor(env.BANK_DB, key) });
}
