CREATE TABLE accounts (
  username_key TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  name_on_card TEXT NOT NULL,
  card_number TEXT NOT NULL UNIQUE,
  expiry TEXT NOT NULL,
  cvv TEXT NOT NULL,
  sort_code TEXT NOT NULL,
  account_number TEXT NOT NULL,
  opening_balance_pence INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  last_used_at TEXT NOT NULL
);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES accounts(username_key) ON DELETE CASCADE,
  posted_at TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount_pence INTEGER NOT NULL,
  reference TEXT
);

CREATE INDEX transactions_by_account ON transactions (username_key, posted_at);
CREATE INDEX accounts_by_last_used ON accounts (last_used_at);
