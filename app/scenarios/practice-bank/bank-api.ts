import type { BankAccount } from "./bank-data";

const DEFAULT_BANK_URL = "https://tutri-practice-bank.yama-builds.workers.dev";

export const BANK_API_URL = (process.env.NEXT_PUBLIC_PRACTICE_BANK_URL || DEFAULT_BANK_URL).replace(/\/$/, "");

type CardFields = { nameOnCard: string; cardNumber: string; expiry: string; cvv: string };
type DeliveryFields = { fullName: string; addressLine1: string; townOrCity: string; postcode: string };
export type PaymentFields = CardFields & DeliveryFields;

export async function request(path: string, init?: RequestInit): Promise<{ status: number; body: Record<string, unknown> } | null> {
  try {
    const response = await fetch(`${BANK_API_URL}${path}`, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
      cache: "no-store",
    });
    const body: unknown = await response.json().catch(() => ({}));
    return { status: response.status, body: body && typeof body === "object" ? (body as Record<string, unknown>) : {} };
  } catch {
    return null;
  }
}

export type CreateAccountResult =
  | { ok: true; account: BankAccount }
  | { ok: false; reason: "taken" | "invalid" | "unavailable"; message?: string };

export async function createAccount(username: string): Promise<CreateAccountResult> {
  const result = await request("/accounts", { method: "POST", body: JSON.stringify({ username }) });
  if (result?.status === 201) return { ok: true, account: result.body.account as BankAccount };
  if (result?.status === 409) return { ok: false, reason: "taken" };
  if (result?.status === 400) return { ok: false, reason: "invalid", message: String(result.body.message ?? "") };
  return { ok: false, reason: "unavailable" };
}

export type GetAccountResult = { status: "ready"; account: BankAccount } | { status: "not-found" } | { status: "error" };

export async function getAccount(username: string): Promise<GetAccountResult> {
  const result = await request(`/accounts/${encodeURIComponent(username.trim())}`);
  if (result?.status === 200) return { status: "ready", account: result.body.account as BankAccount };
  if (result?.status === 404) return { status: "not-found" };
  return { status: "error" };
}

export type PaymentResult =
  | { ok: true; username: string; balancePence: number }
  | { ok: false; reason: "card-not-found" | "unavailable" }
  | { ok: false; reason: "card-details"; errors: Partial<Record<keyof PaymentFields, string>> }
  | { ok: false; reason: "insufficient-funds"; balancePence: number };

export async function payWithPracticeBank(details: PaymentFields, amountPence: number, reference: string): Promise<PaymentResult> {
  const result = await request("/payments", { method: "POST", body: JSON.stringify({ ...details, amountPence, reference }) });
  if (!result) return { ok: false, reason: "unavailable" };
  const { status, body } = result;
  if (status === 200) return { ok: true, username: String(body.username), balancePence: Number(body.balancePence) };
  if (status === 404) return { ok: false, reason: "card-not-found" };
  if (status === 402) return { ok: false, reason: "insufficient-funds", balancePence: Number(body.balancePence) };
  if (status === 400 && body.error === "card_details_wrong") {
    return { ok: false, reason: "card-details", errors: (body.errors ?? {}) as Partial<Record<keyof PaymentFields, string>> };
  }
  return { ok: false, reason: "unavailable" };
}
