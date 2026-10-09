import { loadAccount } from "../accounts";
import { usernameKey, validateUsername } from "../bank";
import { loadEnergy } from "../energy-store";
import { json, readJson, secureRandom } from "../http";
import type {
  AnswerResult,
  AttemptSummary,
  ExerciseListing,
  LearnerListItem,
  LearnerSummary,
  LearnerTask,
} from "../shared/exercise-types";
import { getSite, pageMatches } from "../shared/sites";
import { checkAnswer, type Answer } from "./answers";
import { buildFacts, type LearnerWorld } from "./facts";
import { EXERCISES, environments, getExercise } from "./library";
import { belongsTo, chooseNext, isAvailable, learnerLevel, rankExercises, skillProgress, type HistoryItem } from "./select";
import type { Exercise, Facts } from "./types";
import { allHold, render } from "./values";

type AttemptRow = {
  id: number;
  exercise_id: string;
  environment: string;
  started_by: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  success: number | null;
  attempts: number;
  help_used: number;
};

const DEFAULT_ENVIRONMENT = "energy";
const RECENT_LEARNER_HOURS = 12;
const HISTORY_LIMIT = 300;

function readKey(raw: string): string | null {
  const checked = validateUsername(raw);
  return "error" in checked ? null : usernameKey(checked.username);
}

function readEnvironment(value: unknown): string {
  return typeof value === "string" && environments().includes(value) ? value : DEFAULT_ENVIRONMENT;
}

async function loadWorld(db: D1Database, key: string): Promise<LearnerWorld | null> {
  // Every exercise library so far involves Westford Energy, so its account is opened when needed.
  // Energy first: opening it adds past energy payments to the bank history.
  const energy = await loadEnergy(db, key);
  if (!energy) return null;
  const bank = await loadAccount(db, key);
  return bank ? { bank, energy, now: new Date() } : null;
}

/** Newest first. Exercises replaced by a tutor before the learner tried them are left out. */
async function loadHistory(db: D1Database, key: string): Promise<AttemptRow[]> {
  const { results } = await db
    .prepare(
      `SELECT id, exercise_id, environment, started_by, status, started_at, completed_at, success, attempts, help_used
       FROM exercise_attempts WHERE username_key = ? AND status != 'replaced' ORDER BY started_at DESC, id DESC LIMIT ?`,
    )
    .bind(key, HISTORY_LIMIT)
    .all<AttemptRow>();
  return results;
}

const toHistoryItem = (row: AttemptRow): HistoryItem => ({
  exerciseId: row.exercise_id,
  status: row.status as HistoryItem["status"],
  success: row.success === null ? null : row.success === 1,
  attempts: row.attempts,
  helpUsed: row.help_used === 1,
  startedAt: row.started_at,
});

const UNITS: Record<string, LearnerTask["unit"]> = {
  money: { before: "£" },
  pence: { after: "p" },
  kWh: { after: "kWh" },
  days: { after: "days" },
};

function renderTask(row: AttemptRow, exercise: Exercise, facts: Facts): LearnerTask {
  const { answer } = exercise;
  return {
    attemptId: row.id,
    exerciseId: exercise.id,
    environment: row.environment,
    title: exercise.title,
    instruction: render(exercise.instruction, facts),
    question: exercise.question ? render(exercise.question, facts) : null,
    answerType: answer.type,
    options: answer.type === "choice" ? answer.options.map((option) => ({ id: option.id, label: render(option.label, facts) })) : null,
    multiple: answer.type === "choice" && answer.multiple === true,
    unit: answer.type === "number" ? (UNITS[answer.unit] ?? null) : null,
    sites: exercise.requiredSites.map((id) => ({ id, name: getSite(id)?.name ?? id })),
    status: row.status === "completed" ? "completed" : row.status === "active" ? "active" : "skipped",
    attempts: row.attempts,
    hint: row.help_used ? render(exercise.hint, facts) : null,
    startedBy: row.started_by === "tutor" ? "tutor" : "learner",
    startedAt: row.started_at,
  };
}

function listing(exercise: Exercise, facts: Facts, history: HistoryItem[]): ExerciseListing {
  const done = history.filter((item) => item.exerciseId === exercise.id && item.status !== "active");
  return {
    id: exercise.id,
    title: exercise.title,
    instruction: render(exercise.instruction, facts),
    category: exercise.category,
    difficulty: exercise.difficulty,
    skills: exercise.skills,
    answerType: exercise.answer.type,
    sites: [...exercise.requiredSites],
    available: isAvailable(exercise, facts),
    timesDone: done.length,
    lastSuccess: done[0] ? done[0].success === true : null,
  };
}

async function findActive(db: D1Database, key: string): Promise<AttemptRow | null> {
  return db
    .prepare(
      `SELECT id, exercise_id, environment, started_by, status, started_at, completed_at, success, attempts, help_used
       FROM exercise_attempts WHERE username_key = ? AND status = 'active'`,
    )
    .bind(key)
    .first<AttemptRow>();
}

async function findLatest(db: D1Database, key: string): Promise<AttemptRow | null> {
  return db
    .prepare(
      `SELECT id, exercise_id, environment, started_by, status, started_at, completed_at, success, attempts, help_used
       FROM exercise_attempts WHERE username_key = ? AND status != 'replaced' ORDER BY started_at DESC, id DESC LIMIT 1`,
    )
    .bind(key)
    .first<AttemptRow>();
}

/** Starts an exercise, closing whatever the learner was doing. An untouched exercise is forgotten; a tried one counts as skipped. */
async function startExercise(db: D1Database, key: string, exercise: Exercise, environment: string, startedBy: "tutor" | "learner"): Promise<AttemptRow> {
  const now = new Date().toISOString();
  await db.batch([
    db
      .prepare(
        `UPDATE exercise_attempts SET status = CASE WHEN attempts > 0 OR help_used = 1 THEN 'skipped' ELSE 'replaced' END,
           success = CASE WHEN attempts > 0 OR help_used = 1 THEN 0 ELSE NULL END, completed_at = ?
         WHERE username_key = ? AND status = 'active'`,
      )
      .bind(now, key),
    db
      .prepare(
        `INSERT INTO exercise_attempts (username_key, exercise_id, environment, difficulty, skills, started_by, status, started_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
      )
      .bind(key, exercise.id, environment, exercise.difficulty, JSON.stringify(exercise.skills), startedBy, now),
  ]);
  const active = await findActive(db, key);
  if (!active) throw new Error("Exercise was not started.");
  return active;
}

function recommend(world: LearnerWorld, history: HistoryItem[], environment: string): Exercise | null {
  const facts = buildFacts(world, new Date().toISOString());
  return chooseNext(rankExercises(EXERCISES, { environment, facts, history }), secureRandom);
}

type Loaded = { key: string; world: LearnerWorld; active: AttemptRow; exercise: Exercise; facts: Facts };

async function loadActive(db: D1Database, rawUsername: string): Promise<Loaded | Response> {
  const key = readKey(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const active = await findActive(db, key);
  if (!active) return json({ error: "no_active_exercise" }, 409);
  const exercise = getExercise(active.exercise_id);
  const world = await loadWorld(db, key);
  if (!world) return json({ error: "account_not_found" }, 404);
  if (!exercise) {
    await db.prepare("UPDATE exercise_attempts SET status = 'replaced' WHERE id = ?").bind(active.id).run();
    return json({ error: "no_active_exercise" }, 409);
  }
  return { key, world, active, exercise, facts: buildFacts(world, active.started_at) };
}

async function finish(db: D1Database, loaded: Loaded, correct: boolean, countAttempt: boolean): Promise<LearnerTask> {
  const now = new Date().toISOString();
  const attempts = loaded.active.attempts + (countAttempt ? 1 : 0);
  if (correct) {
    await db
      .prepare("UPDATE exercise_attempts SET status = 'completed', success = 1, completed_at = ?, attempts = ? WHERE id = ?")
      .bind(now, Math.max(attempts, 1), loaded.active.id)
      .run();
  } else if (countAttempt) {
    await db.prepare("UPDATE exercise_attempts SET attempts = ? WHERE id = ?").bind(attempts, loaded.active.id).run();
  }
  const row: AttemptRow = {
    ...loaded.active,
    attempts: correct ? Math.max(attempts, 1) : attempts,
    status: correct ? "completed" : "active",
    success: correct ? 1 : null,
    completed_at: correct ? now : null,
  };
  return renderTask(row, loaded.exercise, loaded.facts);
}

const CORRECT = "✓ That's right.";
const GENERIC_WRONG = "That's not quite right. Have another look.";

function wrongFeedback(specific: string | undefined, exercise: Exercise, facts: Facts): string {
  if (specific) return render(specific, facts);
  return render(exercise.feedback || GENERIC_WRONG, facts);
}

// ---------- Learner endpoints ----------

export async function getCurrentTask(env: Env, rawUsername: string): Promise<Response> {
  const key = readKey(rawUsername);
  if (!key) return json({ task: null });
  const latest = await findLatest(env.BANK_DB, key);
  if (!latest) return json({ task: null });
  const exercise = getExercise(latest.exercise_id);
  // A finished task stays on screen (with "Next task") until the learner moves on.
  if (!exercise || (latest.status !== "active" && latest.status !== "completed")) return json({ task: null });
  const world = await loadWorld(env.BANK_DB, key);
  if (!world) return json({ error: "account_not_found" }, 404);
  return json({ task: renderTask(latest, exercise, buildFacts(world, latest.started_at)) });
}

export async function nextTask(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readKey(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = (await readJson(request)) ?? {};
  const world = await loadWorld(env.BANK_DB, key);
  if (!world) return json({ error: "account_not_found" }, 404);

  const latest = await findLatest(env.BANK_DB, key);
  const environment = readEnvironment(body.environment ?? latest?.environment);
  const history = (await loadHistory(env.BANK_DB, key)).map(toHistoryItem);
  const exercise = recommend(world, history, environment);
  if (!exercise) return json({ error: "no_exercises_left" }, 404);

  const row = await startExercise(env.BANK_DB, key, exercise, environment, "learner");
  return json({ task: renderTask(row, exercise, buildFacts(world, row.started_at)) }, 201);
}

export async function answerTask(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const loaded = await loadActive(env.BANK_DB, rawUsername);
  if (loaded instanceof Response) return loaded;
  const body = await readJson(request);
  const raw = body?.answer;
  const answer: Answer | null =
    typeof raw === "string" ? raw.slice(0, 200) : Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string").slice(0, 20) : null;
  if (answer === null) return json({ error: "bad_request" }, 400);

  const { exercise, facts } = loaded;
  const checked = checkAnswer(exercise.answer, answer, facts);
  let correct = checked.correct;
  let feedback = correct ? CORRECT : wrongFeedback(checked.feedback, exercise, facts);
  if (correct && exercise.alsoRequired && !allHold(exercise.alsoRequired.conditions, facts)) {
    correct = false;
    feedback = render(exercise.alsoRequired.feedback, facts);
  }

  const task = await finish(env.BANK_DB, loaded, correct, true);
  return json({ correct, feedback, task } satisfies AnswerResult);
}

/** Actions are checked from the learner's world. `auto` checks (after each page change) do not count as attempts. */
export async function checkTask(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const loaded = await loadActive(env.BANK_DB, rawUsername);
  if (loaded instanceof Response) return loaded;
  const body = (await readJson(request)) ?? {};
  const auto = body.auto === true;
  const { exercise, facts } = loaded;

  if (exercise.answer.type === "navigation") {
    const page = typeof body.page === "string" ? body.page : "";
    const correct = exercise.answer.pages.some((pattern) => pageMatches(page, pattern));
    const task = await finish(env.BANK_DB, loaded, correct, !auto);
    return json({ correct, feedback: correct ? CORRECT : wrongFeedback(undefined, exercise, facts), task } satisfies AnswerResult);
  }

  if (exercise.answer.type !== "action") return json({ error: "not_an_action" }, 400);
  const correct = allHold(exercise.answer.success, facts);
  const task = await finish(env.BANK_DB, loaded, correct, !auto && !correct);
  return json({ correct, feedback: correct ? CORRECT : wrongFeedback(undefined, exercise, facts), task } satisfies AnswerResult);
}

export async function showHint(env: Env, rawUsername: string): Promise<Response> {
  const loaded = await loadActive(env.BANK_DB, rawUsername);
  if (loaded instanceof Response) return loaded;
  await env.BANK_DB.prepare("UPDATE exercise_attempts SET help_used = 1 WHERE id = ?").bind(loaded.active.id).run();
  return json({ task: renderTask({ ...loaded.active, help_used: 1 }, loaded.exercise, loaded.facts) });
}

export async function skipTask(env: Env, rawUsername: string): Promise<Response> {
  const key = readKey(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  await env.BANK_DB.prepare("UPDATE exercise_attempts SET status = 'skipped', success = 0, completed_at = ? WHERE username_key = ? AND status = 'active'")
    .bind(new Date().toISOString(), key)
    .run();
  return json({ task: null });
}

// ---------- Tutor endpoints ----------

/** Tutor Mode lists learners, so it needs the tutor key (a Worker secret). */
export function tutorAllowed(request: Request, env: Env): Response | null {
  const expected = env.TUTOR_KEY;
  if (!expected) return json({ error: "tutor_mode_not_set_up" }, 503);
  const given = new TextEncoder().encode(request.headers.get("X-Tutor-Key") ?? "");
  const wanted = new TextEncoder().encode(expected);
  const matches = given.byteLength === wanted.byteLength && crypto.subtle.timingSafeEqual(given, wanted);
  return matches ? null : json({ error: "wrong_tutor_key" }, 401);
}

export async function listLearners(env: Env): Promise<Response> {
  const since = new Date(Date.now() - RECENT_LEARNER_HOURS * 60 * 60 * 1000).toISOString();
  const [accounts, active] = await env.BANK_DB.batch<Record<string, unknown>>([
    env.BANK_DB.prepare("SELECT username_key, username, full_name, last_used_at FROM accounts WHERE last_used_at >= ? ORDER BY last_used_at DESC LIMIT 60").bind(since),
    env.BANK_DB.prepare("SELECT username_key, exercise_id FROM exercise_attempts WHERE status = 'active'"),
  ]);
  const current = new Map(active.results.map((row) => [String(row.username_key), String(row.exercise_id)]));
  const learners: LearnerListItem[] = accounts.results.map((row) => ({
    username: String(row.username),
    fullName: String(row.full_name),
    lastUsedAt: String(row.last_used_at),
    currentTitle: getExercise(current.get(String(row.username_key)) ?? "")?.title ?? null,
  }));
  return json({ learners });
}

export async function learnerSummary(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readKey(rawUsername);
  const world = key ? await loadWorld(env.BANK_DB, key) : null;
  if (!key || !world) return json({ error: "account_not_found" }, 404);

  const environment = readEnvironment(new URL(request.url).searchParams.get("environment"));
  const rows = await loadHistory(env.BANK_DB, key);
  const history = rows.map(toHistoryItem);
  const facts = buildFacts(world, new Date().toISOString());
  const recommended = recommend(world, history, environment);
  const activeRow = rows.find((row) => row.status === "active");
  const activeExercise = activeRow ? getExercise(activeRow.exercise_id) : undefined;

  const recent: AttemptSummary[] = rows.slice(0, 15).flatMap((row) => {
    const exercise = getExercise(row.exercise_id);
    if (!exercise) return [];
    return [
      {
        attemptId: row.id,
        exerciseId: row.exercise_id,
        title: exercise.title,
        difficulty: exercise.difficulty,
        status: row.status as AttemptSummary["status"],
        success: row.success === null ? null : row.success === 1,
        attempts: row.attempts,
        helpUsed: row.help_used === 1,
        startedAt: row.started_at,
        completedAt: row.completed_at,
      },
    ];
  });

  const summary: LearnerSummary = {
    username: world.bank.username,
    fullName: world.bank.fullName,
    addressLine1: world.bank.addressLine1,
    townOrCity: world.bank.townOrCity,
    postcode: world.bank.postcode,
    level: learnerLevel(history, EXERCISES),
    current: activeRow && activeExercise ? renderTask(activeRow, activeExercise, buildFacts(world, activeRow.started_at)) : null,
    recommended: recommended ? listing(recommended, facts, history) : null,
    recent,
    skills: skillProgress(history, EXERCISES),
    completedCount: history.filter((item) => item.success === true).length,
    exercises: EXERCISES.filter((exercise) => belongsTo(exercise, environment)).map((exercise) => listing(exercise, facts, history)),
  };
  return json({ summary, environments: environments() });
}

export async function tutorStart(request: Request, env: Env, rawUsername: string): Promise<Response> {
  const key = readKey(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_request" }, 400);

  const world = await loadWorld(env.BANK_DB, key);
  if (!world) return json({ error: "account_not_found" }, 404);
  const environment = readEnvironment(body.environment);
  const history = (await loadHistory(env.BANK_DB, key)).map(toHistoryItem);

  const exercise = typeof body.exerciseId === "string" ? getExercise(body.exerciseId) : recommend(world, history, environment);
  if (!exercise) return json({ error: "exercise_not_found" }, 404);
  if (!isAvailable(exercise, buildFacts(world, new Date().toISOString()))) return json({ error: "exercise_not_available" }, 409);

  const row = await startExercise(env.BANK_DB, key, exercise, environment, "tutor");
  return json({ task: renderTask(row, exercise, buildFacts(world, row.started_at)) }, 201);
}

export async function tutorStop(env: Env, rawUsername: string): Promise<Response> {
  const key = readKey(rawUsername);
  if (!key) return json({ error: "account_not_found" }, 404);
  await env.BANK_DB.prepare(
    `UPDATE exercise_attempts SET status = CASE WHEN attempts > 0 OR help_used = 1 THEN 'skipped' ELSE 'replaced' END,
       success = CASE WHEN attempts > 0 OR help_used = 1 THEN 0 ELSE NULL END, completed_at = ?
     WHERE username_key = ? AND status = 'active'`,
  )
    .bind(new Date().toISOString(), key)
    .run();
  return json({ ok: true });
}
