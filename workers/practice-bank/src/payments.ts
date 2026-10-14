import { BALANCE_SQL } from "./accounts";

export type SharedDebit = {
  usernameKey: string;
  amountPence: number;
  postedAt: string;
  description: string;
  type: string;
  category: string;
  reference: string;
  idempotencyKey: string | null;
};

export type DebitResult =
  | { ok: true; duplicate: boolean; reference: string; balancePence: number }
  | { ok: false; error: "insufficient_funds"; balancePence: number }
  | { ok: false; error: "idempotency_conflict" };

type ExistingDebit = { reference: string | null; amount_pence: number; description: string };

/** Client-generated keys are UUIDs. Empty means this payment cannot be replayed safely. */
export function readIdempotencyKey(value: unknown): string | null | "invalid" {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{8,80}$/.test(value)) return "invalid";
  return value;
}

async function findExisting(db: D1Database, idempotencyKey: string): Promise<ExistingDebit | null> {
  return db
    .prepare("SELECT reference, amount_pence, description FROM transactions WHERE idempotency_key = ?")
    .bind(idempotencyKey)
    .first<ExistingDebit>();
}

async function balanceOf(db: D1Database, usernameKey: string): Promise<number> {
  return (await db.prepare(`SELECT ${BALANCE_SQL} AS balance`).bind(usernameKey).first<number>("balance")) ?? 0;
}

function matches(existing: ExistingDebit, debit: SharedDebit): boolean {
  return existing.amount_pence === -debit.amountPence && existing.description === debit.description;
}

/**
 * Subtracts from the Practice Bank ledger only when the balance covers it.
 * The same idempotency key returns the original transaction instead of charging again.
 */
export async function debitSharedBalance(db: D1Database, debit: SharedDebit): Promise<DebitResult> {
  if (debit.idempotencyKey) {
    const existing = await findExisting(db, debit.idempotencyKey);
    if (existing) {
      if (!matches(existing, debit)) return { ok: false, error: "idempotency_conflict" };
      return {
        ok: true,
        duplicate: true,
        reference: existing.reference ?? debit.reference,
        balancePence: await balanceOf(db, debit.usernameKey),
      };
    }
  }

  let inserted: D1Result;
  try {
    inserted = await db
      .prepare(
        `INSERT INTO transactions (username_key, posted_at, description, type, category, amount_pence, reference, idempotency_key)
         SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8
         WHERE ${BALANCE_SQL} >= ?9
           AND (?8 IS NULL OR NOT EXISTS (SELECT 1 FROM transactions WHERE idempotency_key = ?8))`,
      )
      .bind(
        debit.usernameKey,
        debit.postedAt,
        debit.description,
        debit.type,
        debit.category,
        -debit.amountPence,
        debit.reference,
        debit.idempotencyKey,
        debit.amountPence,
      )
      .run();
  } catch (error) {
    if (!debit.idempotencyKey || !String(error).toLowerCase().includes("unique")) throw error;
    const existing = await findExisting(db, debit.idempotencyKey);
    if (!existing || !matches(existing, debit)) return { ok: false, error: "idempotency_conflict" };
    return {
      ok: true,
      duplicate: true,
      reference: existing.reference ?? debit.reference,
      balancePence: await balanceOf(db, debit.usernameKey),
    };
  }

  if (inserted.meta.changes === 0) {
    if (debit.idempotencyKey) {
      const existing = await findExisting(db, debit.idempotencyKey);
      if (existing) {
        if (!matches(existing, debit)) return { ok: false, error: "idempotency_conflict" };
        return {
          ok: true,
          duplicate: true,
          reference: existing.reference ?? debit.reference,
          balancePence: await balanceOf(db, debit.usernameKey),
        };
      }
    }
    return { ok: false, error: "insufficient_funds", balancePence: await balanceOf(db, debit.usernameKey) };
  }

  await db.prepare("UPDATE accounts SET last_used_at = ? WHERE username_key = ?").bind(debit.postedAt, debit.usernameKey).run();
  return { ok: true, duplicate: false, reference: debit.reference, balancePence: await balanceOf(db, debit.usernameKey) };
}
