-- Accounts opened before this have empty values; the Worker fills them in the next time the account is used.
ALTER TABLE accounts ADD COLUMN full_name TEXT NOT NULL DEFAULT '';
ALTER TABLE accounts ADD COLUMN address_line1 TEXT NOT NULL DEFAULT '';
ALTER TABLE accounts ADD COLUMN town_or_city TEXT NOT NULL DEFAULT '';
ALTER TABLE accounts ADD COLUMN postcode TEXT NOT NULL DEFAULT '';
