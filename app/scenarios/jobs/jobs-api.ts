import { request } from "../practice-bank/bank-api";
import type { ApplicationDraft } from "../../../workers/practice-bank/src/shared/job-application";

export type SavedJob = { jobId: string; savedAt: string };

export type InterviewInvitation = {
  date: string;
  time: string;
  location: string;
  instructions: string;
};

export type PracticeApplication = {
  reference: string;
  jobId: string;
  jobTitle: string;
  employer: string;
  location: string;
  submittedAt: string;
  status: string;
  form: ApplicationDraft | null;
  interview: InterviewInvitation | null;
  fictional: boolean;
};

export type JobsAccount = {
  username: string;
  saved: SavedJob[];
  applications: PracticeApplication[];
  exercises: { id: string; completedAt: string }[];
};

export async function getJobsAccount(username: string): Promise<JobsAccount | null> {
  const result = await request(`/jobs/${encodeURIComponent(username)}`);
  if (result?.status !== 200) return null;
  return result.body as unknown as JobsAccount;
}

export async function saveVacancy(username: string, jobId: string) {
  const result = await request(`/jobs/${encodeURIComponent(username)}/saved`, {
    method: "POST",
    body: JSON.stringify({ jobId }),
  });
  if (result?.status !== 200) return null;
  return result.body.saved as SavedJob[];
}

export async function unsaveVacancy(username: string, jobId: string) {
  const result = await request(`/jobs/${encodeURIComponent(username)}/saved/remove`, {
    method: "POST",
    body: JSON.stringify({ jobId }),
  });
  if (result?.status !== 200) return null;
  return result.body.saved as SavedJob[];
}

export async function submitPracticeApplication(username: string, jobId: string, draft: ApplicationDraft) {
  const result = await request(`/jobs/${encodeURIComponent(username)}/applications`, {
    method: "POST",
    body: JSON.stringify({ ...draft, jobId }),
  });
  if (!result) return { ok: false as const, reason: "unavailable" as const };
  if (result.status === 201) {
    return { ok: true as const, reference: String(result.body.reference), applications: result.body.applications as PracticeApplication[] };
  }
  if (result.status === 400 && result.body.error === "invalid_application") {
    return { ok: false as const, reason: "invalid" as const, errors: (result.body.errors ?? {}) as Record<string, string> };
  }
  return { ok: false as const, reason: "unavailable" as const };
}

export async function checkPracticeTask(username: string | null, exerciseId: string, answer: string, answers: string[]) {
  const result = await request("/jobs/exercises/check", {
    method: "POST",
    body: JSON.stringify({ username, exerciseId, answer, answers }),
  });
  if (!result || result.status !== 200) return null;
  return {
    correct: result.body.correct === true,
    feedback: String(result.body.feedback ?? ""),
    needsSignIn: result.body.needsSignIn === true,
  };
}
