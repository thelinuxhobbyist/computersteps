import { makeIdentity, usernameKey, validateUsername } from "./bank";
import { json, readJson, secureRandom } from "./http";
import {
  getMedicine,
  lastMonthsOrderDate,
  makeNhsNumber,
  makePrescriptionReference,
  orderItems,
  pickRepeatMedicines,
  readOrder,
} from "./surgery";

type PatientRow = {
  username_key: string;
  username: string;
  full_name: string;
  address_line1: string;
  town_or_city: string;
  postcode: string;
  nhs_number: string;
  medicine_ids: string;
};

type OrderRow = {
  id: number;
  placed_at: string;
  reference: string;
  kind: string;
  items: string;
  reason: string | null;
  message: string | null;
  status: string;
};

const ORDER_INSERT =
  "INSERT INTO prescription_orders (username_key, placed_at, reference, kind, items, reason, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

async function loadPatient(db: D1Database, key: string) {
  const patient = await db.prepare("SELECT * FROM patients WHERE username_key = ?").bind(key).first<PatientRow>();
  if (!patient) return null;

  const [{ results }] = await db.batch<OrderRow>([
    db
      .prepare("SELECT id, placed_at, reference, kind, items, reason, message, status FROM prescription_orders WHERE username_key = ? ORDER BY placed_at DESC, id DESC")
      .bind(key),
    db.prepare("UPDATE patients SET last_used_at = ? WHERE username_key = ?").bind(new Date().toISOString(), key),
  ]);

  const medicineIds: string[] = JSON.parse(patient.medicine_ids);
  return {
    username: patient.username,
    fullName: patient.full_name,
    addressLine1: patient.address_line1,
    townOrCity: patient.town_or_city,
    postcode: patient.postcode,
    nhsNumber: patient.nhs_number,
    repeatMedicines: medicineIds.flatMap((id) => {
      const medicine = getMedicine(id);
      return medicine ? [{ id: medicine.id, name: medicine.name, instructions: medicine.instructions }] : [];
    }),
    orders: results.map((row) => ({
      id: row.id,
      placedAt: row.placed_at,
      reference: row.reference,
      kind: row.kind,
      items: JSON.parse(row.items) as string[],
      reason: row.reason,
      message: row.message,
      status: row.status,
    })),
  };
}

export async function createPatient(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  const checked = validateUsername(body.username);
  if ("error" in checked) return json({ error: "invalid_username", message: checked.error }, 400);

  const key = usernameKey(checked.username);
  const existing = await env.BANK_DB.prepare("SELECT 1 FROM patients WHERE username_key = ?").bind(key).first();
  if (existing) return json({ error: "username_taken" }, 409);

  const identity = makeIdentity(secureRandom);
  const medicineIds = pickRepeatMedicines(secureRandom);
  const now = new Date();

  try {
    await env.BANK_DB.batch([
      env.BANK_DB.prepare(
        `INSERT INTO patients (username_key, username, full_name, address_line1, town_or_city, postcode, nhs_number, medicine_ids, created_at, last_used_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        key,
        checked.username,
        identity.fullName,
        identity.addressLine1,
        identity.townOrCity,
        identity.postcode,
        makeNhsNumber(secureRandom),
        JSON.stringify(medicineIds),
        now.toISOString(),
        now.toISOString(),
      ),
      env.BANK_DB.prepare(ORDER_INSERT).bind(
        key,
        lastMonthsOrderDate(now, secureRandom).toISOString(),
        makePrescriptionReference(secureRandom),
        "repeat",
        JSON.stringify(orderItems({ kind: "repeat", medicineIds, message: "" })),
        null,
        null,
        "Collected",
      ),
    ]);
  } catch (error) {
    if (String(error).includes("patients.username_key")) return json({ error: "username_taken" }, 409);
    throw error;
  }

  return json({ patient: await loadPatient(env.BANK_DB, key) }, 201);
}

export async function getPatient(env: Env, rawUsername: string): Promise<Response> {
  const checked = validateUsername(rawUsername);
  if ("error" in checked) return json({ error: "patient_not_found" }, 404);
  const patient = await loadPatient(env.BANK_DB, usernameKey(checked.username));
  return patient ? json({ patient }) : json({ error: "patient_not_found" }, 404);
}

export async function orderPrescription(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const checked = validateUsername(rawUsername);
  if ("error" in checked) return json({ error: "patient_not_found" }, 404);
  const key = usernameKey(checked.username);

  const patient = await env.BANK_DB.prepare("SELECT medicine_ids FROM patients WHERE username_key = ?").bind(key).first<{ medicine_ids: string }>();
  if (!patient) return json({ error: "patient_not_found" }, 404);

  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  const result = readOrder(body, JSON.parse(patient.medicine_ids));
  if ("errors" in result) return json({ error: "invalid_order", errors: result.errors }, 400);

  const { order } = result;
  const now = new Date().toISOString();
  const reference = makePrescriptionReference(secureRandom);
  await env.BANK_DB.batch([
    env.BANK_DB.prepare(ORDER_INSERT).bind(
      key,
      now,
      reference,
      order.kind,
      JSON.stringify(orderItems(order)),
      order.kind === "other" ? order.reason : null,
      order.kind === "repeat" && order.message ? order.message : null,
      order.kind === "repeat" && !order.message ? "Sent to your pharmacy" : "Waiting for a doctor to check",
    ),
    env.BANK_DB.prepare("UPDATE patients SET last_used_at = ? WHERE username_key = ?").bind(now, key),
  ]);

  return json({ reference, patient: await loadPatient(env.BANK_DB, key) }, 201);
}
