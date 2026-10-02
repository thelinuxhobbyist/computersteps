CREATE TABLE patients (
  username_key TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  full_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  town_or_city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  nhs_number TEXT NOT NULL,
  medicine_ids TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_used_at TEXT NOT NULL
);

CREATE TABLE prescription_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES patients(username_key) ON DELETE CASCADE,
  placed_at TEXT NOT NULL,
  reference TEXT NOT NULL,
  kind TEXT NOT NULL,
  items TEXT NOT NULL,
  reason TEXT,
  message TEXT,
  status TEXT NOT NULL
);

CREATE INDEX prescription_orders_by_patient ON prescription_orders (username_key, placed_at);
CREATE INDEX patients_by_last_used ON patients (last_used_at);
