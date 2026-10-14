import { request } from "../practice-bank/bank-api";
import type { MobileAccount } from "../../../workers/practice-bank/src/shared/mobile-types";

export async function getMobile(username: string) {
  const result = await request(`/mobile/${encodeURIComponent(username)}`);
  if (result?.status === 200) return { status: "ready" as const, mobile: result.body.mobile as MobileAccount };
  if (result?.status === 404) return { status: "not-found" as const };
  return { status: "error" as const };
}

export async function payMobile(username: string, idempotencyKey: string) {
  const result = await request(`/mobile/${encodeURIComponent(username)}/payments`, { method: "POST", body: JSON.stringify({ idempotencyKey }) });
  if (!result) return { ok: false as const, reason: "unavailable" as const };
  if (result.status === 200) {
    return {
      ok: true as const,
      mobile: result.body.mobile as MobileAccount,
      reference: String(result.body.reference),
      amountPence: Number(result.body.amountPence),
      balancePence: typeof result.body.balancePence === "number" ? result.body.balancePence : null,
    };
  }
  if (result.status === 402) return { ok: false as const, reason: "insufficient-funds" as const, balancePence: Number(result.body.balancePence) };
  if (result.status === 400) return { ok: false as const, reason: "nothing-to-pay" as const };
  return { ok: false as const, reason: "unavailable" as const };
}

export async function changePlan(username: string, planId: string) {
  const result = await request(`/mobile/${encodeURIComponent(username)}/plan`, { method: "POST", body: JSON.stringify({ planId }) });
  if (result?.status === 200) return { ok: true as const, mobile: result.body.mobile as MobileAccount };
  return { ok: false as const };
}

export async function sendMobileMessage(username: string, topic: string, message: string) {
  const result = await request(`/mobile/${encodeURIComponent(username)}/messages`, { method: "POST", body: JSON.stringify({ topic, message }) });
  if (result && (result.status === 200 || result.status === 201)) {
    return { ok: true as const, mobile: result.body.mobile as MobileAccount, reference: String(result.body.reference) };
  }
  if (result?.status === 400 && result.body.errors) return { ok: false as const, errors: result.body.errors as Record<string, string> };
  return { ok: false as const, errors: { message: "We couldn't save your message. Try again." } };
}
