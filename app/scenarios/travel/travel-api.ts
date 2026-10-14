import { request } from "../practice-bank/bank-api";
import type { TravelQuote } from "../../../workers/practice-bank/src/shared/travel";

export type TravelBooking = {
  reference: string;
  quote: TravelQuote | null;
  totalPence: number;
  status: string;
  paymentReference: string | null;
  createdAt: string;
};

export type TravelIdentity = { username: string; fullName: string; addressLine1: string; townOrCity: string; postcode: string };

export async function getTravel(username: string) {
  const result = await request(`/travel/${encodeURIComponent(username)}`);
  if (result?.status === 200) return { status: "ready" as const, identity: result.body.identity as TravelIdentity, bookings: result.body.bookings as TravelBooking[] };
  if (result?.status === 404) return { status: "not-found" as const };
  return { status: "error" as const };
}

export async function bookTrip(username: string, body: Record<string, string | number>, idempotencyKey: string) {
  const result = await request(`/travel/${encodeURIComponent(username)}/bookings`, { method: "POST", body: JSON.stringify({ ...body, idempotencyKey }) });
  if (!result) return { ok: false as const, reason: "unavailable" as const };
  if (result.status === 200) {
    return {
      ok: true as const,
      reference: String(result.body.reference),
      balancePence: typeof result.body.balancePence === "number" ? result.body.balancePence : null,
      bookings: result.body.bookings as TravelBooking[],
    };
  }
  if (result.status === 402) return { ok: false as const, reason: "insufficient-funds" as const, balancePence: Number(result.body.balancePence) };
  if (result.status === 400 && result.body.error === "card_details_wrong" && result.body.errors && typeof result.body.errors === "object") {
    return { ok: false as const, reason: "details" as const, errors: result.body.errors as Record<string, string> };
  }
  return { ok: false as const, reason: "invalid" as const, message: String(result.body.message ?? "Check the booking and try again.") };
}

export async function cancelTrip(username: string, reference: string) {
  const result = await request(`/travel/${encodeURIComponent(username)}/bookings/${encodeURIComponent(reference)}/cancel`, { method: "POST", body: "{}" });
  if (result?.status === 200) return { ok: true as const, bookings: result.body.bookings as TravelBooking[], balancePence: Number(result.body.balancePence) };
  return { ok: false as const };
}
