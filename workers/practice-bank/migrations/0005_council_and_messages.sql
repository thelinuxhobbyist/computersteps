-- Fictional enquiry references, status and simulated replies for Westford Energy messages.
ALTER TABLE energy_messages ADD COLUMN reference TEXT;
ALTER TABLE energy_messages ADD COLUMN status TEXT NOT NULL DEFAULT 'received';
ALTER TABLE energy_messages ADD COLUMN reply_at TEXT;
ALTER TABLE energy_messages ADD COLUMN reply_body TEXT;

UPDATE energy_messages SET reference = printf('WE-LEGACY-%d', id) WHERE reference IS NULL;

CREATE UNIQUE INDEX energy_messages_reference ON energy_messages (reference);

-- Westford Council belongs to the same Practice Bank identity.
CREATE TABLE council_accounts (
  username_key TEXT PRIMARY KEY REFERENCES accounts(username_key) ON DELETE CASCADE,
  resident_number TEXT NOT NULL UNIQUE,
  council_tax_reference TEXT NOT NULL UNIQUE,
  council_tax_band TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE council_tax_bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES council_accounts(username_key) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  year_label TEXT NOT NULL,
  issued_on TEXT NOT NULL,
  period_start TEXT NOT NULL,
  due_on TEXT NOT NULL,
  instalment_number INTEGER NOT NULL,
  instalments_total INTEGER NOT NULL,
  amount_pence INTEGER NOT NULL
);

CREATE TABLE council_tax_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES council_accounts(username_key) ON DELETE CASCADE,
  paid_at TEXT NOT NULL,
  amount_pence INTEGER NOT NULL,
  method TEXT NOT NULL,
  reference TEXT NOT NULL
);

CREATE TABLE council_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES council_accounts(username_key) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  topic TEXT NOT NULL,
  location TEXT,
  body TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  reply_at TEXT,
  reply_body TEXT
);

CREATE INDEX council_tax_bills_by_account ON council_tax_bills (username_key, period_start);
CREATE INDEX council_tax_payments_by_account ON council_tax_payments (username_key, paid_at);
CREATE INDEX council_requests_by_account ON council_requests (username_key, submitted_at);
