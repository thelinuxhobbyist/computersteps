import { request } from "../practice-bank/bank-api";
import type { OrderType, Patient, PrescriptionErrors } from "./prescription-order";

export type RegisterResult =
  | { ok: true; patient: Patient }
  | { ok: false; reason: "taken" | "invalid" | "unavailable"; message?: string };

export async function registerPatient(username: string): Promise<RegisterResult> {
  const result = await request("/patients", { method: "POST", body: JSON.stringify({ username }) });
  if (result?.status === 201) return { ok: true, patient: result.body.patient as Patient };
  if (result?.status === 409) return { ok: false, reason: "taken" };
  if (result?.status === 400) return { ok: false, reason: "invalid", message: String(result.body.message ?? "") };
  return { ok: false, reason: "unavailable" };
}

export type GetPatientResult = { status: "ready"; patient: Patient } | { status: "not-found" } | { status: "error" };

export async function getPatient(username: string): Promise<GetPatientResult> {
  const result = await request(`/patients/${encodeURIComponent(username.trim())}`);
  if (result?.status === 200) return { status: "ready", patient: result.body.patient as Patient };
  if (result?.status === 404) return { status: "not-found" };
  return { status: "error" };
}

export type OrderToSend = { kind: OrderType; medicineIds: string[]; medicineName: string; reason: string; message: string };

export type SendOrderResult =
  | { ok: true; reference: string; patient: Patient }
  | { ok: false; reason: "invalid"; errors: PrescriptionErrors }
  | { ok: false; reason: "not-found" | "unavailable" };

export async function sendPrescriptionOrder(username: string, order: OrderToSend): Promise<SendOrderResult> {
  const result = await request(`/patients/${encodeURIComponent(username)}/prescriptions`, {
    method: "POST",
    body: JSON.stringify(order),
  });
  if (result?.status === 201) return { ok: true, reference: String(result.body.reference), patient: result.body.patient as Patient };
  if (result?.status === 400 && result.body.error === "invalid_order") {
    return { ok: false, reason: "invalid", errors: (result.body.errors ?? {}) as PrescriptionErrors };
  }
  if (result?.status === 404) return { ok: false, reason: "not-found" };
  return { ok: false, reason: "unavailable" };
}
