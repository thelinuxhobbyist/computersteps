-- Repeated payments with the same key must not charge the learner twice.
-- Existing transactions keep a null key, so this does not change balances already stored.
ALTER TABLE transactions ADD COLUMN idempotency_key TEXT;

CREATE UNIQUE INDEX transactions_idempotency ON transactions (idempotency_key) WHERE idempotency_key IS NOT NULL;
