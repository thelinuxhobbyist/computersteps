import { request } from "../practice-bank/bank-api";
import type { CouncilAccount } from "../../../workers/practice-bank/src/shared/council-types";

export type CouncilResult = { status: "ready"; council: CouncilAccount } | { status: "not-found" } | { status: "error" };

export async function getCouncil(username: string): Promise<CouncilResult> {
  const result = await request(`/council/${encodeURIComponent(username.trim())}`);
  if (result?.status === 200) return { status: "ready", council: result.body.council as CouncilAccount };
  if (result?.status === 404) return { status: "not-found" };
  return { status: "error" };
}

export type CouncilRequestInput = { kind: string; topic: string; message: string; location?: string };

export type CouncilAction =
  | { ok: true; council: CouncilAccount; reference: string }
  | { ok: false; errors: Record<string, string> }
  | { ok: false; unavailable: true };

export async function sendCouncilRequest(username: string, input: CouncilRequestInput): Promise<CouncilAction> {
  const result = await request(`/council/${encodeURIComponent(username)}/requests`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (result && (result.status === 200 || result.status === 201)) {
    return { ok: true, council: result.body.council as CouncilAccount, reference: String(result.body.reference) };
  }
  if (result?.status === 400 && result.body.errors) return { ok: false, errors: result.body.errors as Record<string, string> };
  return { ok: false, unavailable: true };
}

export type CouncilPaymentResult =
  | { ok: true; council: CouncilAccount; reference: string; amountPence: number; balancePence: number | null; duplicate: boolean }
  | { ok: false; reason: "nothing-to-pay"; council: CouncilAccount | null }
  | { ok: false; reason: "insufficient-funds"; balancePence: number; council: CouncilAccount | null }
  | { ok: false; reason: "unavailable" };

export async function payCouncilInstalment(username: string, idempotencyKey: string): Promise<CouncilPaymentResult> {
  const result = await request(`/council/${encodeURIComponent(username)}/payments`, {
    method: "POST",
    body: JSON.stringify({ idempotencyKey }),
  });
  if (!result) return { ok: false, reason: "unavailable" };
  if (result.status === 200) {
    return {
      ok: true,
      council: result.body.council as CouncilAccount,
      reference: String(result.body.reference),
      amountPence: Number(result.body.amountPence),
      balancePence: typeof result.body.balancePence === "number" ? result.body.balancePence : null,
      duplicate: Boolean(result.body.duplicate),
    };
  }
  const council = result.body.council ? (result.body.council as CouncilAccount) : null;
  if (result.status === 400 && result.body.error === "nothing_to_pay") return { ok: false, reason: "nothing-to-pay", council };
  if (result.status === 402) return { ok: false, reason: "insufficient-funds", balancePence: Number(result.body.balancePence), council };
  return { ok: false, reason: "unavailable" };
}
