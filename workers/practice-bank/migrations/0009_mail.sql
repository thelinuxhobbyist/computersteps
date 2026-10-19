-- One mailbox per Computer Steps account. Scenario sites insert rows here.
-- Messages are deleted by age from the worker, so the table cannot grow without limit.
CREATE TABLE mail_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES accounts(username_key) ON DELETE CASCADE,
  mailbox TEXT NOT NULL CHECK (mailbox IN ('inbox', 'sent')),
  from_name TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_name TEXT NOT NULL,
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  visible_at TEXT NOT NULL,
  read_at TEXT,
  conversation_id TEXT NOT NULL,
  scenario TEXT NOT NULL,
  event_key TEXT NOT NULL,
  event_ref TEXT,
  attachments_json TEXT NOT NULL DEFAULT '[]'
);

CREATE UNIQUE INDEX mail_event_key ON mail_messages (username_key, event_key);
CREATE INDEX mail_box ON mail_messages (username_key, mailbox, visible_at);
