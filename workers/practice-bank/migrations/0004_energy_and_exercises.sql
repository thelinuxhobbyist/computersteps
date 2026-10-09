-- Westford Energy belongs to the Practice Bank identity, so closing an inactive bank account removes it too.
CREATE TABLE energy_accounts (
  username_key TEXT PRIMARY KEY REFERENCES accounts(username_key) ON DELETE CASCADE,
  account_number TEXT NOT NULL UNIQUE,
  meter_serial TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'pay_on_receipt',
  dd_account_name TEXT,
  dd_sort_code TEXT,
  dd_account_number TEXT,
  dd_day INTEGER,
  dd_set_up_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE energy_bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES energy_accounts(username_key) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  issued_on TEXT NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  due_on TEXT NOT NULL,
  opening_reading INTEGER NOT NULL,
  closing_reading INTEGER NOT NULL,
  reading_type TEXT NOT NULL,
  kwh INTEGER NOT NULL,
  unit_rate_pence INTEGER NOT NULL,
  standing_charge_pence INTEGER NOT NULL,
  days INTEGER NOT NULL,
  amount_pence INTEGER NOT NULL
);

CREATE TABLE energy_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES energy_accounts(username_key) ON DELETE CASCADE,
  paid_at TEXT NOT NULL,
  amount_pence INTEGER NOT NULL,
  method TEXT NOT NULL,
  reference TEXT NOT NULL
);

CREATE TABLE energy_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES energy_accounts(username_key) ON DELETE CASCADE,
  read_on TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  reading INTEGER NOT NULL,
  source TEXT NOT NULL
);

CREATE TABLE energy_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES energy_accounts(username_key) ON DELETE CASCADE,
  sent_at TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL
);

CREATE INDEX energy_bills_by_account ON energy_bills (username_key, period_start);
CREATE INDEX energy_payments_by_account ON energy_payments (username_key, paid_at);
CREATE INDEX energy_readings_by_account ON energy_readings (username_key, read_on);
CREATE INDEX energy_messages_by_account ON energy_messages (username_key, sent_at);

-- One row each time a learner is given an exercise. Exercise definitions live in code (src/exercises/library).
CREATE TABLE exercise_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES accounts(username_key) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  environment TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  skills TEXT NOT NULL,
  started_by TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  success INTEGER,
  attempts INTEGER NOT NULL DEFAULT 0,
  help_used INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX exercise_attempts_by_learner ON exercise_attempts (username_key, started_at);
CREATE UNIQUE INDEX exercise_attempts_one_active ON exercise_attempts (username_key) WHERE status = 'active';
