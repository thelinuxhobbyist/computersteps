import { request } from "../practice-bank/bank-api";

export type DeliveryRequest = { id: number; trackingCode: string; action: string; detail: string; reference: string; savedAt: string };
export type DeliveryIdentity = { username: string; fullName: string; addressLine1: string; townOrCity: string; postcode: string };

export async function getDeliveries(username: string) {
  const result = await request(`/deliveries/${encodeURIComponent(username)}`);
  if (result?.status === 200) return { status: "ready" as const, identity: result.body.identity as DeliveryIdentity, requests: result.body.requests as DeliveryRequest[] };
  if (result?.status === 404) return { status: "not-found" as const };
  return { status: "error" as const };
}

export async function saveDelivery(username: string, body: { trackingCode?: string; action: string; detail: string }) {
  const result = await request(`/deliveries/${encodeURIComponent(username)}/requests`, { method: "POST", body: JSON.stringify(body) });
  if (result && (result.status === 200 || result.status === 201)) {
    return { ok: true as const, reference: String(result.body.reference), requests: result.body.requests as DeliveryRequest[] };
  }
  const errors = (result?.body.errors as Record<string, string> | undefined) ?? {};
  return { ok: false as const, message: errors.detail || "We couldn't save that change. Check the details and try again." };
}
