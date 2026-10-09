import { request } from "../scenarios/practice-bank/bank-api";
import type {
  AnswerResult,
  ExerciseListing,
  LearnerListItem,
  LearnerSummary,
  LearnerTask,
} from "../../workers/practice-bank/src/shared/exercise-types";

export type { AnswerResult, ExerciseListing, LearnerListItem, LearnerSummary, LearnerTask };
export { CATEGORY_LABELS, DIFFICULTIES, SKILL_LABELS } from "../../workers/practice-bank/src/shared/exercise-types";
export type { Category, Difficulty, Skill } from "../../workers/practice-bank/src/shared/exercise-types";

const learnerPath = (username: string) => `/learners/${encodeURIComponent(username)}/exercise`;

const post = (path: string, body: unknown = {}, headers?: Record<string, string>) =>
  request(path, { method: "POST", body: JSON.stringify(body), headers, quiet: true });

// ---------- Learner ----------

/** `undefined` means the server could not be reached. */
export async function getCurrentTask(username: string): Promise<LearnerTask | null | undefined> {
  const result = await request(learnerPath(username));
  if (result?.status === 200) return (result.body.task as LearnerTask | null) ?? null;
  if (result?.status === 404) return null;
  return undefined;
}

export type NextTaskResult = { ok: true; task: LearnerTask } | { ok: false; reason: "none-left" | "unavailable" };

export async function startNextTask(username: string, environment: string): Promise<NextTaskResult> {
  const result = await post(`${learnerPath(username)}/next`, { environment });
  if (result?.status === 201) return { ok: true, task: result.body.task as LearnerTask };
  if (result?.status === 404 && result.body.error === "no_exercises_left") return { ok: false, reason: "none-left" };
  return { ok: false, reason: "unavailable" };
}

/** `null` when the task has ended (for example a tutor stopped it), `undefined` when the server could not be reached. */
async function answerRequest(path: string, body: unknown): Promise<AnswerResult | null | undefined> {
  const result = await post(path, body);
  if (result?.status === 200) return result.body as unknown as AnswerResult;
  if (result?.status === 409 || result?.status === 404) return null;
  return undefined;
}

export const answerTask = (username: string, answer: string | string[]) => answerRequest(`${learnerPath(username)}/answer`, { answer });

export const checkTask = (username: string, page: string | null, auto: boolean) => answerRequest(`${learnerPath(username)}/check`, { page, auto });

export async function showHint(username: string): Promise<LearnerTask | null | undefined> {
  const result = await post(`${learnerPath(username)}/hint`);
  if (result?.status === 200) return result.body.task as LearnerTask;
  if (result?.status === 409 || result?.status === 404) return null;
  return undefined;
}

export async function skipTask(username: string): Promise<boolean> {
  const result = await post(`${learnerPath(username)}/skip`);
  return result?.status === 200;
}

// ---------- Tutor ----------

export type TutorResult<T> = { ok: true; value: T } | { ok: false; reason: "wrong-key" | "not-set-up" | "not-found" | "not-available" | "unavailable" };

function tutorFailure(status: number | undefined, error: unknown): TutorResult<never> {
  if (status === 401) return { ok: false, reason: "wrong-key" };
  if (status === 503) return { ok: false, reason: "not-set-up" };
  if (status === 409 && error === "exercise_not_available") return { ok: false, reason: "not-available" };
  if (status === 404) return { ok: false, reason: "not-found" };
  return { ok: false, reason: "unavailable" };
}

const tutorHeaders = (key: string) => ({ "X-Tutor-Key": key });

export async function listLearners(key: string): Promise<TutorResult<LearnerListItem[]>> {
  const result = await request("/tutor/learners", { headers: tutorHeaders(key) });
  if (result?.status === 200) return { ok: true, value: result.body.learners as LearnerListItem[] };
  return tutorFailure(result?.status, result?.body.error);
}

export async function getLearnerSummary(key: string, username: string, environment: string): Promise<TutorResult<{ summary: LearnerSummary; environments: string[] }>> {
  const result = await request(`/tutor/learners/${encodeURIComponent(username)}?environment=${encodeURIComponent(environment)}`, { headers: tutorHeaders(key) });
  if (result?.status === 200) {
    return { ok: true, value: { summary: result.body.summary as LearnerSummary, environments: result.body.environments as string[] } };
  }
  return tutorFailure(result?.status, result?.body.error);
}

export async function tutorStartExercise(key: string, username: string, environment: string, exerciseId?: string): Promise<TutorResult<LearnerTask>> {
  const result = await post(`/tutor/learners/${encodeURIComponent(username)}/exercise`, { environment, exerciseId }, tutorHeaders(key));
  if (result?.status === 201) return { ok: true, value: result.body.task as LearnerTask };
  return tutorFailure(result?.status, result?.body.error);
}

export async function tutorStopExercise(key: string, username: string): Promise<TutorResult<true>> {
  const result = await post(`/tutor/learners/${encodeURIComponent(username)}/exercise/stop`, {}, tutorHeaders(key));
  if (result?.status === 200) return { ok: true, value: true };
  return tutorFailure(result?.status, result?.body.error);
}
