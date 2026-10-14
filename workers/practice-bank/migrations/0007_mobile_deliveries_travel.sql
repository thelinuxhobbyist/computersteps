-- New practice services belong to the same ComputerSteps account.
-- Deleting an inactive bank account removes these rows with it.

CREATE TABLE mobile_accounts (
  username_key TEXT PRIMARY KEY REFERENCES accounts(username_key) ON DELETE CASCADE,
  customer_number TEXT NOT NULL UNIQUE,
  mobile_number TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE mobile_bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES mobile_accounts(username_key) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  period_label TEXT NOT NULL,
  issued_on TEXT NOT NULL,
  due_on TEXT NOT NULL,
  amount_pence INTEGER NOT NULL
);

CREATE TABLE mobile_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES mobile_accounts(username_key) ON DELETE CASCADE,
  paid_at TEXT NOT NULL,
  amount_pence INTEGER NOT NULL,
  reference TEXT NOT NULL
);

CREATE TABLE mobile_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES mobile_accounts(username_key) ON DELETE CASCADE,
  sent_at TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  reply_at TEXT,
  reply_body TEXT
);

CREATE TABLE delivery_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES accounts(username_key) ON DELETE CASCADE,
  tracking_code TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  saved_at TEXT NOT NULL
);

CREATE TABLE travel_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES accounts(username_key) ON DELETE CASCADE,
  reference TEXT NOT NULL UNIQUE,
  summary_json TEXT NOT NULL,
  total_pence INTEGER NOT NULL,
  status TEXT NOT NULL,
  payment_reference TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX mobile_bills_by_account ON mobile_bills (username_key, issued_on);
CREATE INDEX mobile_payments_by_account ON mobile_payments (username_key, paid_at);
CREATE INDEX delivery_requests_by_account ON delivery_requests (username_key, saved_at);
CREATE INDEX travel_bookings_by_account ON travel_bookings (username_key, created_at);
