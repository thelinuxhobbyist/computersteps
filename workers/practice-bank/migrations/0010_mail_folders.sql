-- Folders beyond Inbox and Sent, stars, and a short tip on practice spam.
ALTER TABLE mail_messages ADD COLUMN folder TEXT NOT NULL DEFAULT '';
ALTER TABLE mail_messages ADD COLUMN starred INTEGER NOT NULL DEFAULT 0;
ALTER TABLE mail_messages ADD COLUMN note TEXT NOT NULL DEFAULT '';

UPDATE mail_messages SET folder = mailbox WHERE folder = '';
