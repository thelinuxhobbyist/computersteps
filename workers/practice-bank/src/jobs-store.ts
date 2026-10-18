import { findAccountRow, identityOf } from "./accounts";
import { usernameKey, validateUsername } from "./bank";
import { checkJobExercise, type ExerciseApplication, type ExerciseSnapshot } from "./job-exercise-checks";
import { json, readJson, secureRandom } from "./http";
import { makeEnquiryReference } from "./messaging";
import {
  interviewDate,
  practiceStatus,
  readDraft,
  validateDraft,
  type ApplicationDraft,
  type ApplicationStatus,
} from "./shared/job-application";
import { findVacancy } from "./shared/job-catalogue";
import { formatLocation } from "./shared/jobs";
import { getPublicExercise } from "./shared/job-exercises";
import { practiceProfileFromIdentity } from "./shared/practice-profile";

const APPLICATION_BODY_BYTES = 12000;

type SaveRow = { job_id: string; saved_at: string };
type ApplicationRow = {
  job_id: string;
  reference: string;
  submitted_at: string;
  status: string;
  form_json: string;
  interview_json: string | null;
};
type ProgressRow = { exercise_id: string; completed_at: string };

function accountKey(raw: string): string | null {
  const checked = validateUsername(raw);
  return "error" in checked ? null : usernameKey(checked.username);
}

async function touch(db: D1Database, key: string) {
  await db.prepare("UPDATE accounts SET last_used_at = ? WHERE username_key = ?").bind(new Date().toISOString(), key).run();
}

function presentApplication(row: ApplicationRow) {
  const job = findVacancy(row.job_id);
  let form: ApplicationDraft | null = null;
  let interview: { date: string; time: string; location: string; instructions: string } | null = null;
  try {
    form = JSON.parse(row.form_json) as ApplicationDraft;
  } catch {
    form = null;
  }
  if (row.interview_json) {
    try {
      interview = JSON.parse(row.interview_json) as { date: string; time: string; location: string; instructions: string };
    } catch {
      interview = null;
    }
  }
  return {
    reference: row.reference,
    jobId: row.job_id,
    jobTitle: job?.title ?? "Practice vacancy",
    employer: job?.employer ?? "Fictional employer",
    location: job ? formatLocation(job) : "",
    submittedAt: row.submitted_at,
    status: row.status,
    form,
    interview,
    fictional: true,
  };
}

async function loadSnapshot(db: D1Database, key: string): Promise<{ saved: SaveRow[]; applications: ApplicationRow[]; progress: ProgressRow[] }> {
  const [saved, applications, progress] = await db.batch<SaveRow | ApplicationRow | ProgressRow>([
    db.prepare("SELECT job_id, saved_at FROM job_saves WHERE username_key = ? ORDER BY saved_at DESC").bind(key),
    db.prepare("SELECT job_id, reference, submitted_at, status, form_json, interview_json FROM job_applications WHERE username_key = ? ORDER BY submitted_at DESC").bind(key),
    db.prepare("SELECT exercise_id, completed_at FROM job_exercise_progress WHERE username_key = ?").bind(key),
  ]);
  return {
    saved: saved.results as SaveRow[],
    applications: applications.results as ApplicationRow[],
    progress: progress.results as ProgressRow[],
  };
}

function snapshotOf(applications: ApplicationRow[], saved: SaveRow[]): ExerciseSnapshot {
  return {
    savedJobIds: saved.map((row) => row.job_id),
    applications: applications.map(
      (row): ExerciseApplication => ({
        jobId: row.job_id,
        reference: row.reference,
        telephone: (() => {
          try {
            return String((JSON.parse(row.form_json) as ApplicationDraft).telephone ?? "");
          } catch {
            return "";
          }
        })(),
        town: (() => {
          try {
            return String((JSON.parse(row.form_json) as ApplicationDraft).town ?? "");
          } catch {
            return "";
          }
        })(),
        status: row.status as ApplicationStatus,
        submittedAt: row.submitted_at,
      }),
    ),
  };
}

export async function getJobs(env: Env, rawUsername: string): Promise<Response> {
  const key = accountKey(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const account = await findAccountRow(env.BANK_DB, key);
  if (!account) return json({ error: "account_not_found" }, 404);
  await touch(env.BANK_DB, key);
  const data = await loadSnapshot(env.BANK_DB, key);
  return json({
    username: account.username,
    profile: practiceProfileFromIdentity(identityOf(account)),
    saved: data.saved.map((row) => ({ jobId: row.job_id, savedAt: row.saved_at })),
    applications: data.applications.map(presentApplication),
    exercises: data.progress.map((row) => ({ id: row.exercise_id, completedAt: row.completed_at })),
  });
}

export async function saveJob(request: Request, env: Env, rawUsername: string, remove: boolean): Promise<Response> {
  const key = accountKey(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const account = await findAccountRow(env.BANK_DB, key);
  if (!account) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  const jobId = typeof body?.jobId === "string" ? body.jobId.trim().toLowerCase() : "";
  if (!findVacancy(jobId)) return json({ error: "job_not_found" }, 404);
  const now = new Date().toISOString();
  if (remove) {
    await env.BANK_DB.prepare("DELETE FROM job_saves WHERE username_key = ? AND job_id = ?").bind(key, jobId).run();
  } else {
    await env.BANK_DB.prepare(
      "INSERT INTO job_saves (username_key, job_id, saved_at) VALUES (?, ?, ?) ON CONFLICT(username_key, job_id) DO UPDATE SET saved_at = excluded.saved_at",
    )
      .bind(key, jobId, now)
      .run();
  }
  await touch(env.BANK_DB, key);
  const data = await loadSnapshot(env.BANK_DB, key);
  return json({ saved: data.saved.map((row) => ({ jobId: row.job_id, savedAt: row.saved_at })) });
}

export async function submitJobApplication(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = accountKey(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const account = await findAccountRow(env.BANK_DB, key);
  if (!account) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request, APPLICATION_BODY_BYTES);
  if (!body) return json({ error: "bad_request" }, 400);
  const jobId = typeof body.jobId === "string" ? body.jobId.trim().toLowerCase() : "";
  const job = findVacancy(jobId);
  if (!job) return json({ error: "job_not_found" }, 404);
  const draft = readDraft(body);
  const errors = validateDraft(draft, "all");
  if (Object.keys(errors).length > 0) return json({ error: "invalid_application", errors }, 400);

  const status = practiceStatus(job.id, job.suspicious === true);
  const now = new Date();
  const interview =
    status === "interview"
      ? {
          date: interviewDate(now.toISOString()),
          time: "10:30",
          location: `${job.employer}, ${formatLocation(job)}${job.postcode ? `, ${job.postcode}` : ""}`,
          instructions:
            "Please arrive 10 minutes early and ask for reception. Bring this application reference. The interview lasts about 30 minutes. Do not bring payment or copies of identity documents.",
        }
      : null;

  let reference = "";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    reference = makeEnquiryReference("WJ", now, secureRandom);
    try {
      await env.BANK_DB.prepare(
        `INSERT INTO job_applications (username_key, job_id, reference, submitted_at, status, form_json, interview_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(key, job.id, reference, now.toISOString(), status, JSON.stringify(draft), interview ? JSON.stringify(interview) : null)
        .run();
      break;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("job_applications.reference") || attempt === 4) throw error;
      reference = "";
    }
  }
  await touch(env.BANK_DB, key);
  const data = await loadSnapshot(env.BANK_DB, key);
  return json({ reference, applications: data.applications.map(presentApplication) }, 201);
}

export async function checkJobsExercise(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);
  const exerciseId = typeof body.exerciseId === "string" ? body.exerciseId : "";
  if (!getPublicExercise(exerciseId)) return json({ error: "exercise_not_found" }, 404);
  const answer = typeof body.answer === "string" ? body.answer.slice(0, 200) : "";
  const answers = Array.isArray(body.answers) ? body.answers.filter((item): item is string => typeof item === "string").slice(0, 8) : [];

  let snapshot: ExerciseSnapshot | null = null;
  let key: string | null = null;
  if (typeof body.username === "string" && body.username.trim()) {
    key = accountKey(body.username);
    if (!key) return json({ error: "account_not_found" }, 404);
    const account = await findAccountRow(env.BANK_DB, key);
    if (!account) return json({ error: "account_not_found" }, 404);
    const data = await loadSnapshot(env.BANK_DB, key);
    snapshot = snapshotOf(data.applications, data.saved);
  }

  const result = checkJobExercise(exerciseId, answer, answers, snapshot);
  if (result.correct && key) {
    await env.BANK_DB.prepare(
      "INSERT INTO job_exercise_progress (username_key, exercise_id, completed_at) VALUES (?, ?, ?) ON CONFLICT(username_key, exercise_id) DO UPDATE SET completed_at = excluded.completed_at",
    )
      .bind(key, exerciseId, new Date().toISOString())
      .run();
    await touch(env.BANK_DB, key);
  }
  return json({ correct: result.correct, feedback: result.feedback, needsSignIn: result.needsSignIn === true });
}
