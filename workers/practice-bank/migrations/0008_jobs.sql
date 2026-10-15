-- Learner records for Westford Jobs.
-- The fictional vacancy catalogue lives in source code, not in this database,
-- so closing an inactive account does not delete the practice jobs.
-- These rows belong to one Computer Steps account and are removed with it.
-- The weekly scheduled task deletes accounts that have not been used for a year
-- (last_used_at). ON DELETE CASCADE then removes that learner's saved jobs,
-- practice applications and exercise progress.

CREATE TABLE job_saves (
  username_key TEXT NOT NULL REFERENCES accounts(username_key) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  saved_at TEXT NOT NULL,
  PRIMARY KEY (username_key, job_id)
);

CREATE TABLE job_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username_key TEXT NOT NULL REFERENCES accounts(username_key) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL,
  form_json TEXT NOT NULL,
  interview_json TEXT
);

CREATE TABLE job_exercise_progress (
  username_key TEXT NOT NULL REFERENCES accounts(username_key) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  PRIMARY KEY (username_key, exercise_id)
);

CREATE INDEX job_saves_by_account ON job_saves (username_key, saved_at);
CREATE INDEX job_applications_by_account ON job_applications (username_key, submitted_at);
