import { request } from "../practice-bank/bank-api";
import type { EnergyAccount } from "./energy-data";

export type FieldErrors = Record<string, string>;

export type GetEnergyResult = { status: "ready"; energy: EnergyAccount } | { status: "not-found" } | { status: "error" };

export async function getEnergy(username: string): Promise<GetEnergyResult> {
  const result = await request(`/energy/${encodeURIComponent(username.trim())}`);
  if (result?.status === 200) return { status: "ready", energy: result.body.energy as EnergyAccount };
  if (result?.status === 404) return { status: "not-found" };
  return { status: "error" };
}

export type ActionResult = { ok: true; energy: EnergyAccount } | { ok: false; errors: FieldErrors } | { ok: false; unavailable: true };

async function post(path: string, body: unknown): Promise<ActionResult> {
  const result = await request(path, { method: "POST", body: JSON.stringify(body) });
  if (result && (result.status === 200 || result.status === 201)) return { ok: true, energy: result.body.energy as EnergyAccount };
  if (result?.status === 400 && result.body.errors) return { ok: false, errors: result.body.errors as FieldErrors };
  return { ok: false, unavailable: true };
}

const base = (username: string) => `/energy/${encodeURIComponent(username)}`;

export const setUpDirectDebit = (username: string, details: { accountName: string; sortCode: string; accountNumber: string; day: number; confirm: boolean }) =>
  post(`${base(username)}/direct-debit`, details);

export const cancelDirectDebit = (username: string) => post(`${base(username)}/direct-debit/cancel`, {});

export const sendMeterReading = (username: string, reading: string) => post(`${base(username)}/readings`, { reading });

export const sendMessage = (username: string, topic: string, message: string) => post(`${base(username)}/messages`, { topic, message });

export type CardFields = { nameOnCard: string; cardNumber: string; expiry: string; cvv: string };

export type CardPaymentResult =
  | { ok: true; reference: string; amountPence: number; balancePence: number | null; energy: EnergyAccount }
  | { ok: false; reason: "card-not-found" | "not-your-card" | "unavailable" }
  | { ok: false; reason: "card-details"; errors: FieldErrors }
  | { ok: false; reason: "insufficient-funds"; balancePence: number };

export async function payByCard(username: string, card: CardFields, amountPence: number): Promise<CardPaymentResult> {
  const result = await request(`${base(username)}/payments`, { method: "POST", body: JSON.stringify({ ...card, amountPence }) });
  if (!result) return { ok: false, reason: "unavailable" };
  const { status, body } = result;
  if (status === 200) {
    return {
      ok: true,
      reference: String(body.reference),
      amountPence: Number(body.amountPence),
      balancePence: typeof body.balancePence === "number" ? body.balancePence : null,
      energy: body.energy as EnergyAccount,
    };
  }
  if (status === 404 && body.error === "card_not_found") return { ok: false, reason: "card-not-found" };
  if (status === 400 && body.error === "not_your_card") return { ok: false, reason: "not-your-card" };
  if (status === 400 && body.error === "card_details_wrong") return { ok: false, reason: "card-details", errors: (body.errors ?? {}) as FieldErrors };
  if (status === 402) return { ok: false, reason: "insufficient-funds", balancePence: Number(body.balancePence) };
  return { ok: false, reason: "unavailable" };
}
